import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src", "app", "api");

function isRouteFile(filePath: string) {
  return filePath.endsWith("route.ts");
}

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (isRouteFile(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixFile(filePath: string) {
  let src = fs.readFileSync(filePath, "utf8");
  const original = src;

  // 1) Remove Promise from params type
  src = src.replace(
    /context:\s*\{\s*params:\s*Promise<\s*\{([^}]+)\}\s*>\s*\}/g,
    (_m, inner) => `context: { params: { ${inner.trim()} } }`
  );

  // 2) Fix old Next.js 13/14 signatures: GET(req, { params })
  src = src.replace(
    /export\s+async\s+function\s+GET\s*\(\s*req\s*:\s*NextRequest\s*,\s*\{\s*params\s*\}\s*\)/g,
    `export async function GET(req: NextRequest, context: { params: any })`
  );
  src = src.replace(
    /export\s+async\s+function\s+GET\s*\(\s*req\s*,\s*\{\s*params\s*\}\s*\)/g,
    `export async function GET(req: NextRequest, context: { params: any })`
  );

  // 3) Fix old Next.js 13/14 signatures: POST(req, { params })
  src = src.replace(
    /export\s+async\s+function\s+POST\s*\(\s*req\s*:\s*NextRequest\s*,\s*\{\s*params\s*\}\s*\)/g,
    `export async function POST(req: NextRequest, context: { params: any })`
  );
  src = src.replace(
    /export\s+async\s+function\s+POST\s*\(\s*req\s*,\s*\{\s*params\s*\}\s*\)/g,
    `export async function POST(req: NextRequest, context: { params: any })`
  );

  // 4) Replace bare `params.` with `context.params.`
  src = src.replace(/([^A-Za-z0-9_])params\./g, (_m, prefix) => `${prefix}context.params.`);

  // 5) Replace destructuring from `params` to `context.params`
  src = src.replace(
    /const\s+\{\s*([^}]+)\s*\}\s*=\s*params\s*;/g,
    (_m, inner) => `const { ${inner.trim()} } = context.params;`
  );

  // 6) Remove stray `req: Request,` lines
  src = src.replace(/^\s*req:\s*Request,\s*$/gm, "");

  // 7) Remove stray `)\s*{` after function signature
  src = src.replace(/\)\s*\{\s*try\s*\{/g, `{\n  try {`);

  if (src !== original) {
    console.log(`Fixed: ${filePath}`);
    fs.writeFileSync(filePath, src, "utf8");
  }
}

function main() {
  if (!fs.existsSync(API_ROOT)) {
    console.error("API root not found:", API_ROOT);
    process.exit(1);
  }

  const files = walk(API_ROOT);
  console.log(`Found ${files.length} route files.`);

  for (const file of files) {
    try {
      fixFile(file);
    } catch (err) {
      console.error(`Error fixing ${file}:`, err);
    }
  }

  console.log("API signature fix complete.");
}

main();
