#!/usr/bin/env node

/**
 * Project Inspection Tool
 * -----------------------
 * Scans /src/app and /lib for:
 * - Missing files
 * - Broken imports
 * - .ts extension imports
 * - Missing helper modules
 * - Route param mismatches (supports destructuring)
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const APP = path.join(SRC, "app");
const LIB = path.join(ROOT, "lib");

const results = {
  missingFiles: [],
  brokenImports: [],
  tsExtensionImports: [],
  missingHelpers: [],
  routeParamMismatches: [],
};

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full, callback);
    } else {
      callback(full);
    }
  });
}

function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Detect .ts extension imports
  const tsImports = content.match(/from\s+["'](.+\.ts)["']/g);
  if (tsImports) {
    results.tsExtensionImports.push({
      file: filePath,
      imports: tsImports,
    });
  }

  // Detect imports and check existence
  const importMatches = content.match(/from\s+["'](.+)["']/g);
  if (importMatches) {
    importMatches.forEach((match) => {
      const importPath = match.split("from")[1].trim().replace(/["']/g, "");

      // Skip node_modules and Next.js internals
      if (importPath.startsWith("@") || importPath.startsWith("next")) return;

      const resolved = path.resolve(path.dirname(filePath), importPath);

      if (
        !fs.existsSync(resolved) &&
        !fs.existsSync(resolved + ".ts") &&
        !fs.existsSync(resolved + ".tsx") &&
        !fs.existsSync(resolved + "/index.ts")
      ) {
        results.brokenImports.push({
          file: filePath,
          import: importPath,
        });
      }
    });
  }

  // Detect missing helper modules
  if (content.includes("loadGrantIntelligence")) {
    const helperPath = path.join(
      path.dirname(filePath),
      "_lib/loadGrantIntelligence.ts"
    );
    if (!fs.existsSync(helperPath)) {
      results.missingHelpers.push({
        file: filePath,
        missing: helperPath,
      });
    }
  }

  // Detect route param mismatches (supports destructuring)
  const routeMatch = filePath.match(/\[(.+?)\]/);
  if (routeMatch) {
    const rawParam = routeMatch[1];

    // Fix invalid folder names like [document[Id]
    const paramName = rawParam.replace("[Id", "Id").replace("[id", "Id");

    const directUsage = content.includes(`params.${paramName}`);

    const destructuredUsage =
      content.includes(`const { ${paramName} } = params`) ||
      content.includes(`const {${paramName}} = params`) ||
      content.includes(`const { ${paramName} }`) ||
      content.includes(`const {${paramName}}`);

    if (!directUsage && !destructuredUsage) {
      results.routeParamMismatches.push({
        file: filePath,
        expectedParam: paramName,
      });
    }
  }
}

console.log("🔍 Inspecting project...");

walk(APP, inspectFile);
walk(LIB, inspectFile);

console.log(JSON.stringify(results, null, 2));
