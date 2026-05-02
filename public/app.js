const authDialog = document.querySelector("#authDialog");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const postForm = document.querySelector("#postForm");
const feed = document.querySelector("#feed");
const opportunitiesGrid = document.querySelector("#opportunitiesGrid");
const logoutButton = document.querySelector("#logoutButton");
const postStatus = document.querySelector("#postStatus");
let currentUser = null;

document.querySelector("[data-open-auth]").addEventListener("click", () => authDialog.showModal());
logoutButton.addEventListener("click", logout);
registerForm.addEventListener("submit", handleRegister);
loginForm.addEventListener("submit", handleLogin);
postForm.addEventListener("submit", handlePost);

boot();

async function boot() {
  await refreshMe();
  await Promise.all([loadPosts(), loadOpportunities()]);
}

async function refreshMe() {
  const data = await api("/api/me");
  currentUser = data.user;
  logoutButton.hidden = !currentUser;
  postStatus.textContent = currentUser ? `Publishing as ${currentUser.username}. Keep it anonymous and useful.` : "Sign in with a verified email to publish.";
}

async function handleRegister(event) {
  event.preventDefault();
  const status = document.querySelector("#registerStatus");
  status.textContent = "Creating account...";
  const payload = Object.fromEntries(new FormData(registerForm));

  if (!strongPassword(payload.password)) {
    status.textContent = "Use 12+ chars with uppercase, lowercase, number, and symbol.";
    return;
  }

  try {
    const data = await api("/api/register", { method: "POST", body: payload });
    status.textContent = data.message;
    registerForm.reset();
  } catch (error) {
    status.textContent = error.message;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const status = document.querySelector("#loginStatus");
  status.textContent = "Checking credentials...";

  try {
    const data = await api("/api/login", { method: "POST", body: Object.fromEntries(new FormData(loginForm)) });
    currentUser = data.user;
    status.textContent = `Welcome, ${currentUser.username}.`;
    loginForm.reset();
    setTimeout(() => authDialog.close(), 450);
    await refreshMe();
  } catch (error) {
    status.textContent = error.message;
  }
}

async function handlePost(event) {
  event.preventDefault();
  if (!currentUser) {
    authDialog.showModal();
    return;
  }

  const payload = Object.fromEntries(new FormData(postForm));
  postStatus.textContent = "Scanning for private data...";

  if (containsPrivateData(Object.values(payload).join(" "))) {
    postStatus.textContent = "Private contact data detected locally. Please anonymize before posting.";
    return;
  }

  try {
    await api("/api/posts", { method: "POST", body: payload });
    postForm.reset();
    postStatus.textContent = "Published. Nice clean signal.";
    await loadPosts();
  } catch (error) {
    postStatus.textContent = error.message;
  }
}

async function logout() {
  await api("/api/logout", { method: "POST", body: {} });
  currentUser = null;
  await refreshMe();
}

async function loadPosts() {
  const data = await api("/api/posts");
  feed.innerHTML = data.posts.map(renderPost).join("");
}

async function loadOpportunities() {
  const data = await api("/api/opportunities");
  opportunitiesGrid.innerHTML = data.opportunities.map((item) => `
    <article class="opportunity-card">
      <span class="pill">${escapeHtml(item.meta)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.focus)}</p>
    </article>
  `).join("");
}

function renderPost(post) {
  const tags = post.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("");
  const created = new Date(post.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  return `
    <article class="post-card">
      <div class="post-meta">
        <span class="pill">${escapeHtml(post.type)}</span>
        <span>${escapeHtml(post.author.username)} · ${escapeHtml(post.author.testerRole)} · ${escapeHtml(post.author.region)}</span>
        <span>${created}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.body)}</p>
      <div class="tag-row">${tags}</div>
    </article>
  `;
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function strongPassword(password) {
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function containsPrivateData(value) {
  return [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /(?:\+?\d[\s().-]?){8,}\d/,
    /\b(?:api[_-]?key|password|secret|token)\b\s*[:=]/i,
    /\b\d{1,5}\s+[A-Za-z0-9.'-]+\s+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|block|sector)\b/i
  ].some((pattern) => pattern.test(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
