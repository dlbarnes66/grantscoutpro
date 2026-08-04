// scripts/fix-route-syntax.ts
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src", "app", "api");

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (entry === "route.ts") {
      files.push(full);
    }
  }
  return files;
}

function fixFile(filePath: string) {
  let code = fs.readFileSync(filePath, "utf8");
  let original = code;

  // 1) Normalize handler signatures to Next 13/16 app router style:
  //    export async function GET(request: NextRequest, { params }: { params: any }) { ... }
  //    export async function POST(request: NextRequest, { params }: { params: any }) { ... }

  const handlerRegex =
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([a-zA-Z_$][\w$]*)\s*:\s*([A-Za-z0-9_.]+)\s*,\s*([a-zA-Z_$][\w$]*)\s*(:\s*[^)]*)?\s*\)/g;

  code = code.replace(handlerRegex, (_m, method, reqName, reqType, ctxName) => {
    // We don’t try to preserve the old context type—just make it safe.
    return `export async function ${method}(${reqName}: ${reqType}, { params }: { params: any })`;
  });

  // Also catch untyped handlers like: (request, context)
  const handlerUntypedRegex =
    /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(\s*([a-zA-Z_$][\w$]*)\s*,\s*([a-zA-Z_$][\w$]*)\s*\)/g;

  code = code.replace(handlerUntypedRegex, (_m, method, reqName, ctxName) => {
    return `export async function ${method}(${reqName}: any, { params }: { params: any })`;
  });

  // 2) Replace context.params.* with params.*
  //    e.g. const { workspaceId } = context.params;
  code = code.replace(/context\.params\./g, "params.");

  // 3) Optional: replace whole destructuring from context.params
  //    const { workspaceId } = context.params;
  code = code.replace(
    /const\s+\{\s*([^}]+)\s*\}\s*=\s*context\.params\s*;/g,
    "const { $1 } = params;"
  );

  if (code !== original) {
    fs.writeFileSync(filePath, code, "utf8");
    console.log("Fixed:", filePath);
  }
}

function main() {
  const files = walk(ROOT);
  console.log("Found route files:", files.length);
  for (const file of files) {
    fixFile(file);
  }
}

main();
