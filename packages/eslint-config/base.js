/**
 * @streamify/eslint-config — Base ESLint Configuration
 * Shared rules for all Streamify apps
 */
import js from "@eslint/js";

export default [
    {
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": ["warn", { allow: ["warn", "error", "info"] }],
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
            "brace-style": ["error", "1tbs", { allowSingleLine: false }],
        },
    },
];
