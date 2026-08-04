import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src", "app", "api");

// Extract everything inside the file EXCEPT import/export wrappers
function extractLogic(code: string): string {
  // Remove any broken export signatures
  code = code.replace(/export\s+async\s+function\s+\w+\s*\([^)]*\)\s*[{;]?/g, "");

  // Remove stray braces at start/end
  code = code.replace(/^{/, "").replace(/}$/, "");

  // Remove duplicate params definitions
  code = code.replace(/const\s+params\s*=\s*context\.params;/g, "");

  // Remove broken "return outside function" errors by keeping the code raw
  return code.trim();
}

function reconstruct(filePath: string) {
  let code = fs.readFileSync(filePath, "utf8");
  const original = code;

  // If file already has a valid handler, skip
  if (/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\)\s*{/.test(code)) {
    return;
  }

  console.log("Reconstructing:", filePath);

  const method =
    code.includes("GET") ? "GET" :
    code.includes("POST") ? "POST" :
    "POST";

  const logic = extractLogic(code);

  const reconstructed = `
import { NextResponse } from "next/server";

export async function ${method}(req: any, { params }: { params: any }) {
  try {
${logic
  .split("\n")
  .map(line => "    " + line)
  .join("\n")}
  } catch (err: any) {
    console.error("ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
`;

  fs.writeFileSync(filePath, reconstructed, "utf8");
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
  console.log("Reconstructing", files.length, "route files...");

  for (const file of files) {
    try {
      reconstruct(file);
    } catch (err) {
      console.error("Error reconstructing", file, err);
    }
  }

  console.log("Route reconstruction complete.");
}

main();
