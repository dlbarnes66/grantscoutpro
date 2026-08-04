import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src", "app", "api");

// Detect if file is missing a proper handler wrapper
function needsWrapper(code: string): boolean {
  // If the file has a semicolon after the function signature → broken
  if (/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\)\s*;/.test(code)) {
    return true;
  }

  // If file starts with "{" → broken
  if (code.trimStart().startsWith("{")) {
    return true;
  }

  // If file has "return NextResponse" outside any function → broken
  if (/^[^]*return\s+NextResponse/m.test(code) && !/export\s+async\s+function/.test(code)) {
    return true;
  }

  return false;
}

// Extract method name if present
function detectMethod(code: string): string {
  const match = code.match(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/);
  return match ? match[1] : "POST";
}

function repairFile(filePath: string) {
  let code = fs.readFileSync(filePath, "utf8");
  const original = code;

  if (!needsWrapper(code)) return;

  console.log("Repairing:", filePath);

  // Remove broken semicolon after function signature
  code = code.replace(
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(([^)]*)\)\s*;/g,
    (m, method, args) => `export async function ${method}(${args}) {`
  );

  // If file starts with "{", wrap entire file
  if (code.trimStart().startsWith("{")) {
    const method = detectMethod(code);
    code = `export async function ${method}(req: any, { params }: { params: any }) ${code}`;
  }

  // If file has no handler at all, wrap entire file
  if (!/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/.test(code)) {
    const method = detectMethod(code);
    code = `export async function ${method}(req: any, { params }: { params: any }) {\n${code}\n}`;
  }

  // Ensure closing brace exists
  if (!code.trim().endsWith("}")) {
    code += "\n}";
  }

  // Fix context.params → params
  code = code.replace(/context\.params/g, "params");

  fs.writeFileSync(filePath, code, "utf8");
}

function walk(dir: string, files: string[] = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (entry === "route.ts") files.push(full);
  }
  return files;
}

function main() {
  const files = walk(API_ROOT);
  console.log("Scanning", files.length, "route files...");

  for (const file of files) {
    try {
      repairFile(file);
    } catch (err) {
      console.error("Error repairing", file, err);
    }
  }

  console.log("Route repair complete.");
}

main();
