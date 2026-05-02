# Testers Nexus

A futuristic secure community website for manual, automation, performance, security, accessibility, mobile, game, and QA leadership testers.

## Run Locally

```powershell
npm start
```

Open `http://localhost:3000`.

## Development Email Verification

This prototype does not send real email. After registration, the verification link is written to:

```text
data/dev-email-outbox.log
```

Open the link in a browser, then sign in.

## Security Notes

- Passwords are never stored as plaintext. They are salted and hashed with PBKDF2.
- Sessions use random tokens stored in HTTP-only, SameSite cookies.
- Email verification is required before sign-in.
- API requests are validated server-side.
- Posts and profile fields are scanned to reject likely private data such as emails, phone numbers, addresses, tokens, secrets, and password-like disclosures.
- The local JSON file is suitable for a prototype. For production, replace it with PostgreSQL or another managed database, add real transactional guarantees, managed email, observability, backups, WAF/CDN protection, and a full moderation workflow.

## Structure

```text
server.js          Backend API, auth, validation, persistence, static hosting
public/index.html  Main website
public/styles.css  Futuristic responsive UI and animations
public/app.js      Frontend API integration and interaction logic
data/              Runtime database and development verification outbox
```
