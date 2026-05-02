const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
const OUTBOX_FILE = path.join(DATA_DIR, "dev-email-outbox.log");

const MAX_BODY_BYTES = 1_000_000;
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60;
const PBKDF2_ITERATIONS = 310000;
const allowedRoles = new Set(["manual", "automation", "performance", "security", "accessibility", "mobile", "game", "leadership", "student", "other"]);
const allowedPostTypes = new Set(["experience", "job", "referral", "interview", "tooling", "question"]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

const rateBuckets = new Map();

ensureDatabase();

const server = http.createServer(async (req, res) => {
  try {
    setSecurityHeaders(res);

    if (req.url.startsWith("/api/")) {
      await routeApi(req, res);
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unexpected server error. Please try again." });
  }
});

server.listen(PORT, () => {
  console.log(`Testers Nexus running at http://localhost:${PORT}`);
  console.log("Verification links are written to data/dev-email-outbox.log in development.");
});

async function routeApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ip = req.socket.remoteAddress || "unknown";

  if (!consumeRateLimit(ip, url.pathname)) {
    sendJson(res, 429, { error: "Too many attempts. Please slow down for a minute." });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/register") {
    const payload = await readJsonBody(req);
    const db = readDb();
    const validation = validateRegistration(payload);
    if (!validation.ok) return sendJson(res, 400, { error: validation.error });

    const email = normalizeEmail(payload.email);
    const username = String(payload.username).trim();
    const exists = db.users.some((user) => user.email === email || user.username.toLowerCase() === username.toLowerCase());
    if (exists) return sendJson(res, 409, { error: "That username or email is already registered." });

    const token = randomToken();
    const user = {
      id: crypto.randomUUID(),
      username,
      email,
      passwordHash: hashPassword(payload.password),
      testerRole: payload.testerRole,
      region: sanitizeShortText(payload.region || "Global"),
      bio: sanitizeShortText(payload.bio || ""),
      emailVerified: false,
      emailVerification: {
        tokenHash: hashToken(token),
        expiresAt: Date.now() + EMAIL_TOKEN_TTL_MS
      },
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    writeDb(db);
    writeVerificationEmail(user, token);
    sendJson(res, 201, {
      message: "Account created. Check data/dev-email-outbox.log for the development verification link."
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/verify-email") {
    const token = url.searchParams.get("token") || "";
    const db = readDb();
    const user = db.users.find((candidate) => candidate.emailVerification && candidate.emailVerification.tokenHash === hashToken(token));
    if (!user || user.emailVerification.expiresAt < Date.now()) {
      sendHtml(res, 400, verificationPage("Verification failed", "This verification link is invalid or expired."));
      return;
    }

    user.emailVerified = true;
    user.emailVerification = null;
    writeDb(db);
    sendHtml(res, 200, verificationPage("Email verified", "Your tester identity is verified. You can return to the Nexus and sign in."));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const payload = await readJsonBody(req);
    const email = normalizeEmail(payload.email || "");
    const db = readDb();
    const user = db.users.find((candidate) => candidate.email === email);
    if (!user || !verifyPassword(payload.password || "", user.passwordHash)) {
      return sendJson(res, 401, { error: "Invalid email or password." });
    }
    if (!user.emailVerified) {
      return sendJson(res, 403, { error: "Please verify your email before signing in." });
    }

    const sessionToken = randomToken();
    db.sessions.push({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: Date.now() + SESSION_TTL_MS,
      createdAt: new Date().toISOString()
    });
    pruneSessions(db);
    writeDb(db);
    setSessionCookie(res, sessionToken);
    sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/logout") {
    const db = readDb();
    const session = getSession(req, db);
    if (session) db.sessions = db.sessions.filter((item) => item.id !== session.id);
    writeDb(db);
    clearSessionCookie(res);
    sendJson(res, 200, { message: "Signed out." });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/me") {
    const db = readDb();
    const session = getSession(req, db);
    if (!session) return sendJson(res, 200, { user: null });
    const user = db.users.find((candidate) => candidate.id === session.userId);
    sendJson(res, 200, { user: user ? publicUser(user) : null });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/posts") {
    const db = readDb();
    const posts = db.posts
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((post) => ({ ...post, author: publicAuthor(db, post.userId) }));
    sendJson(res, 200, { posts });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/posts") {
    const db = readDb();
    const session = getSession(req, db);
    if (!session) return sendJson(res, 401, { error: "Sign in to publish to the community." });

    const payload = await readJsonBody(req);
    const validation = validatePost(payload);
    if (!validation.ok) return sendJson(res, 400, { error: validation.error });

    const post = {
      id: crypto.randomUUID(),
      userId: session.userId,
      type: payload.type,
      title: sanitizeLongText(payload.title, 120),
      body: sanitizeLongText(payload.body, 900),
      tags: normalizeTags(payload.tags),
      createdAt: new Date().toISOString()
    };
    db.posts.push(post);
    writeDb(db);
    sendJson(res, 201, { post: { ...post, author: publicAuthor(db, post.userId) } });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/opportunities") {
    sendJson(res, 200, {
      opportunities: [
        { title: "Automation Guild Referrals", meta: "Remote first", focus: "Playwright, Cypress, CI quality gates" },
        { title: "Performance Lab Circle", meta: "Global", focus: "k6, JMeter, observability and bottleneck hunts" },
        { title: "Manual Testing Interview Track", meta: "Mentor led", focus: "Exploratory testing, bug reports, test strategy" }
      ]
    });
    return;
  }

  sendJson(res, 404, { error: "API route not found." });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden." });
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) filePath = path.join(PUBLIC_DIR, "index.html");
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function ensureDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    writeDb({
      users: [],
      sessions: [],
      posts: seedPosts()
    });
  }
  if (!fs.existsSync(OUTBOX_FILE)) fs.writeFileSync(OUTBOX_FILE, "", "utf8");
}

function seedPosts() {
  return [
    {
      id: crypto.randomUUID(),
      userId: "system",
      type: "experience",
      title: "Welcome to the Testers Nexus",
      body: "Share testing wins, interview notes, safe referral leads, tooling discoveries, and lessons from production without posting private contact data.",
      tags: ["community", "privacy", "qa"],
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId: "system",
      type: "interview",
      title: "Interview Process Template",
      body: "Use role, round count, skills tested, practice resources, and anonymized observations. Avoid names, phone numbers, private emails, or confidential company details.",
      tags: ["interviews", "career", "safe-sharing"],
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    }
  ];
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(db) {
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmpFile, DB_FILE);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Request body too large."));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });
    req.on("error", reject);
  });
}

function validateRegistration(payload) {
  const username = String(payload.username || "").trim();
  const email = normalizeEmail(payload.email || "");
  const password = String(payload.password || "");
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) return { ok: false, error: "Username must be 3-24 characters using letters, numbers, underscores, or hyphens." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (!allowedRoles.has(payload.testerRole)) return { ok: false, error: "Choose a valid tester role." };
  if (!isStrongPassword(password)) return { ok: false, error: "Password must be at least 12 characters with uppercase, lowercase, number, and symbol." };
  if (containsPrivateData(`${payload.bio || ""} ${payload.region || ""}`)) return { ok: false, error: "Please remove private contact details from your profile." };
  return { ok: true };
}

function validatePost(payload) {
  const title = String(payload.title || "").trim();
  const body = String(payload.body || "").trim();
  if (!allowedPostTypes.has(payload.type)) return { ok: false, error: "Choose a valid post category." };
  if (title.length < 8 || title.length > 120) return { ok: false, error: "Title must be 8-120 characters." };
  if (body.length < 30 || body.length > 900) return { ok: false, error: "Post body must be 30-900 characters." };
  if (containsPrivateData(`${title} ${body} ${normalizeTags(payload.tags).join(" ")}`)) {
    return { ok: false, error: "Private contact data detected. Please anonymize emails, phone numbers, addresses, and secrets." };
  }
  return { ok: true };
}

function isStrongPassword(password) {
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function containsPrivateData(value) {
  const text = String(value || "");
  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /(?:\+?\d[\s().-]?){8,}\d/,
    /\b(?:api[_-]?key|password|secret|token)\b\s*[:=]/i,
    /\b\d{1,5}\s+[A-Za-z0-9.'-]+\s+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|block|sector)\b/i
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function sanitizeShortText(value) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, 160);
}

function sanitizeLongText(value, max) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}

function normalizeTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, "sha512").toString("hex");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${derived}`;
}

function verifyPassword(password, encoded) {
  const [scheme, iterations, salt, expected] = String(encoded || "").split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !expected) return false;
  const actual = crypto.pbkdf2Sync(password, salt, Number(iterations), 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function randomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getSession(req, db) {
  const token = parseCookies(req).tn_session;
  if (!token) return null;
  pruneSessions(db);
  return db.sessions.find((session) => session.tokenHash === hashToken(token) && session.expiresAt > Date.now()) || null;
}

function pruneSessions(db) {
  db.sessions = db.sessions.filter((session) => session.expiresAt > Date.now());
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const index = item.indexOf("=");
      cookies[item.slice(0, index)] = decodeURIComponent(item.slice(index + 1));
      return cookies;
    }, {});
}

function setSessionCookie(res, token) {
  res.setHeader("Set-Cookie", `tn_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "tn_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    testerRole: user.testerRole,
    region: user.region,
    bio: user.bio,
    emailVerified: user.emailVerified
  };
}

function publicAuthor(db, userId) {
  if (userId === "system") return { username: "Nexus Sentinel", testerRole: "leadership", region: "Global" };
  const user = db.users.find((candidate) => candidate.id === userId);
  return user ? publicUser(user) : { username: "Anonymous tester", testerRole: "other", region: "Global" };
}

function consumeRateLimit(ip, route) {
  const key = `${ip}:${route}`;
  const now = Date.now();
  const current = rateBuckets.get(key) || { count: 0, resetAt: now + 60_000 };
  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + 60_000;
  }
  current.count += 1;
  rateBuckets.set(key, current);
  return current.count <= 80;
}

function writeVerificationEmail(user, token) {
  const link = `http://localhost:${PORT}/api/verify-email?token=${token}`;
  const message = `[${new Date().toISOString()}] To: ${user.email} | Verify ${user.username}: ${link}\n`;
  fs.appendFileSync(OUTBOX_FILE, message, "utf8");
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function verificationPage(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="/styles.css"></head><body><main class="verify-shell"><section class="glass-card"><p class="eyebrow">Testers Nexus</p><h1>${title}</h1><p>${body}</p><a class="button primary" href="/">Return home</a></section></main></body></html>`;
}
