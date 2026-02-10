/**
 * @streamify/shared — Regex Patterns
 * Used by both frontend and backend for validation
 */

export const PATTERNS = {
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
};
