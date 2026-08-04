import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src", "app", "api");

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (stat.isFile() && full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

// Fix patterns like: export async function POST(req: Request{
function fixHandlerSignature(source: string): string {
  let updated = source;

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  for (const method of methods) {
    const badSig = new RegExp(
      `export\\s+async\\s+function\\s+${method}\\s*\\(\\s*req\\s*:\\s*Request\\s*\\{`,
      "g"
    );
    const goodSig = `export async function ${method}(req: Request, context: any) {`;
    updated = updated.replace(badSig, goodSig);
  }

  // Some files may use NextRequest instead of Request
  for (const method of methods) {
    const badSig = new RegExp(
      `export\\s+async\\s+function\\s+${method}\\s*\\(\\s*request\\s*:\\s*NextRequest\\s*\\{`,
      "g"
    );
    const goodSig = `export async function ${method}(request: NextRequest, context: any) {`;
    updated = updated.replace(badSig, goodSig);
  }

  return updated;
}

// Fix "await context.params" → "context.params"
function fixContextParams(source: string): string {
  return source.replace(/await\s+context\.params/g, "context.params");
}

// Optional: ensure file starts with an export handler if it was left as a bare block
function ensureExportWrapper(source: string): string {
  // If file starts with just "{", it’s almost certainly a broken handler
  const trimmed = source.trimStart();
  if (trimmed.startsWith("{")) {
    // Very conservative: wrap the whole file in a POST handler
    return `export async function POST(req: Request, context: any) ${trimmed}`;
  }
  return source;
}

function processFile(file: string) {
  const original = fs.readFileSync(file, "utf8");
  let updated = original;

  updated = fixHandlerSignature(updated);
  updated = fixContextParams(updated);
  updated = ensureExportWrapper(updated);

  if (updated !== original) {
    fs.writeFileSync(file, updated, "utf8");
    console.log("Repaired syntax:", file);
  }
}

function main() {
  if (!fs.existsSync(API_ROOT)) {
    console.error("API root not found:", API_ROOT);
    process.exit(1);
  }

  const files = walk(API_ROOT);
  console.log(`Scanning ${files.length} API route files for syntax repair...`);

  for (const file of files) {
    processFile(file);
  }

  console.log("Syntax repair pass complete.");
}

main();
