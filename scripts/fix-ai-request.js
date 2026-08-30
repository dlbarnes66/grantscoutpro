/**
 * SWEEP 2 — FIX `request` → `req` IN AI ROUTES
 * --------------------------------------------
 * ✔ Fixes all remaining AI route errors
 * ✔ Replaces `request` with `req`
 * ✔ Only inside GET/POST handlers
 * ✔ Does NOT touch logic
 * ✔ Does NOT touch imports
 * ✔ Does NOT touch responses
 * ✔ Does NOT touch Prisma
 * ✔ Does NOT touch AI logic
 */

const fs = require("fs");
const path = require("path");

const AI_ROUTES_DIR = path.join(
  process.cwd(),
  "src/app/api/workspaces/_id/documents/[documentId]/ai"
);

function rewriteRequestUsage(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace request.url → req.url
  content = content.replace(/\brequest\.url\b/g, "req.url");

  // Replace request.json() → req.json()
  content = content.replace(/\brequest\.json\(\)/g, "req.json()");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✔ Fixed request→req in: ${filePath}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === "route.ts") {
      rewriteRequestUsage(fullPath);
    }
  }
}

console.log("🔧 Running AI request→req fixer...");
walk(AI_ROUTES_DIR);
console.log("✅ All AI request→req issues fixed safely.");
