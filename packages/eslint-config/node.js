/**
 * @streamify/eslint-config — Node.js Configuration
 * Extends base config with Node-specific rules
 * Used by apps/backend
 */
import globals from "globals";
import baseConfig from "./base.js";

export default [
    ...baseConfig,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
            sourceType: "module",
        },
        rules: {
            "no-process-exit": "off",
        },
    },
];
