import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Flat config (ESLint 9). Replaces the old eslint.config.cjs + .eslintrc.json
// pair, which mixed the two formats and could not run.
//
// The rules turned off below match what the project already had turned off;
// they are too noisy for the existing code to adopt in one step. Real
// problems (syntax errors, hook-order bugs, undefined variables) stay on.
const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "worker/**", "scripts/**", "tools/**", "fix/**", "Claude outputs/**", "next-env.d.ts"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/exhaustive-deps": "off",
      "import/no-anonymous-default-export": "off",
      "no-console": "off",

      // New in the Next 16 / React 19 rule sets. They flag existing patterns
      // across the app (state set inside effects, links to internal pages,
      // quotes in text) that are not bugs. Shown as warnings so they can be
      // cleaned up gradually; they do not fail the build.
      "react/no-unescaped-entities": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "prefer-const": "warn",
    },
  },
];

export default config;
