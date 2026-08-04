const tsParser = require("@typescript-eslint/parser");
const ts = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");

module.exports = [
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["node_modules/**", ".next/**", "grantscout-pro-mobile/**"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd()
      }
    },

    plugins: {
      "@typescript-eslint": ts,
      import: importPlugin
    },

    extends: ["next/core-web-vitals"],

    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      "import/no-unresolved": "off",
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",

      "react-hooks/exhaustive-deps": "off",

      "no-console": "off"
    },

    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json"
        },
        alias: {
          map: [
            ["@", "./src"],
            ["@/app", "./src/app"],
            ["@/components", "./src/components"],
            ["@/hooks", "./src/hooks"],
            ["@/lib", "./src/lib"]
          ],
          extensions: [".ts", ".tsx", ".js", ".jsx"]
        }
      }
    }
  }
];
