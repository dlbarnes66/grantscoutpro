/**
 * AUTO-REWRITE SCRIPT FOR AI ROUTES
 * ---------------------------------
 * ✔ Fixes Next.js 16 route signatures
 * ✔ Removes `context`
 * ✔ Inserts `{ params }`
 * ✔ Fixes GET + POST handlers
 * ✔ Does NOT touch logic
 * ✔ Does NOT touch imports
 * ✔ Does NOT touch responses
 * ✔ Does NOT touch Prisma calls
 * ✔ Does NOT touch AI logic
 */

const fs = require("fs");
const path = require("path");

const AI_ROUTES_DIR = path.join(
  process.cwd(),
  "src/app/api/workspaces/_id/documents/[documentId]/ai"
);

function rewriteRouteSignature(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Fix GET signature
  content = content.replace(
    /export\s+async\s+function\s+GET\s*\(\s*req[^,]*,\s*context[^\)]*\)/g,
    `export async function GET(req, { params })`
  );

  // Fix POST signature
  content = content.replace(
    /export\s+async\s+function\s+POST\s*\(\s*req[^,]*,\s*context[^\)]*\)/g,
    `export async function POST(req, { params })`
  );

  // Remove broken `const { params } = context;`
  content = content.replace(
    /const\s*\{\s*params\s*\}\s*=\s*context\s*;/g,
    ""
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✔ Fixed: ${filePath}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === "route.ts") {
      rewriteRouteSignature(fullPath);
    }
  }
}

console.log("🔧 Running AI route signature fixer...");
walk(AI_ROUTES_DIR);
console.log("✅ All AI route signatures updated safely.");
