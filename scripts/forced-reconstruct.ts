import fs from "fs";
import path from "path";

const API_ROOT = path.join(process.cwd(), "src", "app", "api");

function extractExecutableLines(code: string): string[] {
  const lines = code.split("\n");

  return lines
    .map(line => line.trim())
    .filter(line =>
      line &&
      !line.startsWith("export async function") &&
      !line.startsWith("import") &&
      !line.startsWith("}") &&
      !line.startsWith("{") &&
      !line.includes("catch") &&
      !line.includes("try") &&
      !line.includes("params = context.params") &&
      !line.includes("NextRequest") &&
      !line.includes("NextResponse") &&
      !line.includes("return NextResponse.json(")
    );
}

function forcedReconstruct(filePath: string) {
  const code = fs.readFileSync(filePath, "utf8");

  const method =
    code.includes("POST") ? "POST" :
    code.includes("PUT") ? "PUT" :
    code.includes("DELETE") ? "DELETE" :
    "GET";

  const executable = extractExecutableLines(code);

  const reconstructed = `
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function ${method}(req: NextRequest, { params }: { params: any }) {
  try {
    const body = req.method !== "GET" ? await req.json().catch(() => ({})) : {};
    const documentId = params?.documentId || params?.["documentId"] || params?.["grantId"] || params?.["id"];

${executable.map(line => "    " + line).join("\n")}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("FORCED ROUTE ERROR:", err);
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
  console.log("FORCED reconstruction of", files.length, "route files...");

  for (const file of files) {
    try {
      forcedReconstruct(file);
    } catch (err) {
      console.error("Error reconstructing", file, err);
    }
  }

  console.log("Forced reconstruction complete.");
}

main();
