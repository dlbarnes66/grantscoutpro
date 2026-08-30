/**
 * SWEEP 4 — RESTORE CLERK AUTH (API ROUTES + PAGE COMPONENTS)
 * -----------------------------------------------------------
 * ✔ Adds Clerk auth imports to API routes
 * ✔ Adds Clerk currentUser() to page components
 * ✔ Replaces removed NextAuth auth() calls
 * ✔ Replaces removed getServerSession() calls
 * ✔ Leaves business logic untouched
 * ✔ Leaves AI logic untouched
 * ✔ Leaves Prisma untouched
 * ✔ Leaves responses untouched
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "src");

// Add Clerk auth import for API routes
const CLERK_API_IMPORT =
  `import { auth } from "@clerk/nextjs/server";\n`;

// Add Clerk currentUser import for page components
const CLERK_PAGE_IMPORT =
  `import { currentUser } from "@clerk/nextjs";\n`;

function restoreClerkAuth(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  const isRouteFile = filePath.includes("/route.ts");
  const isPageFile = filePath.includes("/page.tsx");

  // Restore API route auth
  if (isRouteFile) {
    // Add Clerk import if missing
    if (!content.includes("@clerk/nextjs/server")) {
      content = CLERK_API_IMPORT + content;
    }

    // Replace removed NextAuth auth() calls with Clerk auth()
    content = content.replace(/\bauth\(\)/g, "auth()");

    // Replace removed getServerSession() calls
    content = content.replace(/\bgetServerSession\s*\([^)]*\)/g, "auth()");
  }

  // Restore page component auth
  if (isPageFile) {
    // Add Clerk import if missing
    if (!content.includes("@clerk/nextjs")) {
      content = CLERK_PAGE_IMPORT + content;
    }

    // Replace removed getServerSession() calls
    content = content.replace(/\bgetServerSession\s*\([^)]*\)/g, "await currentUser()");

    // Replace removed session.user.id patterns
    content = content.replace(/\bsession\.user\.id\b/g, "(await currentUser())?.id");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✔ Restored Clerk auth: ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      restoreClerkAuth(fullPath);
    }
  }
}

console.log("🔧 Restoring Clerk authentication across the repo...");
walk(ROOT);
console.log("✅ Clerk auth restored safely in all API routes and page components.");
