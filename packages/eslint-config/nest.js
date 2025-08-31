import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import globals from "globals"
import tseslint from "typescript-eslint"

import { config as baseConfig } from "./base.js"

/**
 * A shared ESLint configuration for NestJS services.
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  // Type-aware rules with projectService for multi-project repos
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      // Most Nest apps run under CJS at runtime
      sourceType: "commonjs",
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
]

