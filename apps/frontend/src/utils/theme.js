/**
 * Theme Utility Classes
 * Centralized theme classes using CSS variables for consistency
 */

// Layout & Backgrounds
export const theme = {
    // Page backgrounds
    pageBg: "bg-[var(--bg-primary)]",
    pageGradient:
        "bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]",

    // Cards & Containers
    cardBg: "bg-[var(--card-bg)] border border-[var(--card-border)]",
    cardHover: "hover:bg-[var(--card-hover)] hover:shadow-lg",
    elevatedBg: "bg-[var(--bg-elevated)]",
    glassBg: "bg-[var(--header-bg)] backdrop-blur-xl",

    // Text
    textPrimary: "text-[var(--text-primary)]",
    textSecondary: "text-[var(--text-secondary)]",
    textTertiary: "text-[var(--text-tertiary)]",
    textLink: "text-[var(--text-link)]",

    // Brand
    brandPrimary: "text-[var(--brand-primary)]",
    brandBg: "bg-[var(--brand-primary)]",
    brandGradient:
        "bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]",

    // Borders
    borderLight: "border-[var(--border-light)]",
    borderDefault: "border-[var(--border-default)]",
    divider: "border-[var(--divider)]",

    // Inputs
    inputBg: "bg-[var(--input-bg)]",
    inputBorder: "border-[var(--input-border)]",
    inputFocus:
        "focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent",

    // Buttons
    btnPrimary:
        "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]",
    btnSecondary:
        "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)]",
    btnGhost:
        "bg-transparent text-[var(--text-primary)] hover:bg-[var(--btn-ghost-hover)]",

    // Status
    success: "text-[var(--success)]",
    successBg: "bg-[var(--success-light)]",
    warning: "text-[var(--warning)]",
    warningBg: "bg-[var(--warning-light)]",
    error: "text-[var(--error)]",
    errorBg: "bg-[var(--error-light)]",
    info: "text-[var(--info)]",
    infoBg: "bg-[var(--info-light)]",

    // Shadows
    shadowSm: "shadow-[var(--shadow-sm)]",
    shadowMd: "shadow-[var(--shadow-md)]",
    shadowLg: "shadow-[var(--shadow-lg)]",

    // Overlay
    overlay: "bg-[var(--overlay)]",

    // Skeleton
    skeleton: "animate-pulse bg-[var(--skeleton-base)]",
};

// Compound classes for common patterns
export const patterns = {
    // Card patterns
    card: `${theme.cardBg} rounded-xl ${theme.cardHover} transition-all duration-200`,

    // Input patterns
    input: `${theme.inputBg} ${theme.inputBorder} border rounded-xl px-4 py-2.5 ${theme.textPrimary} placeholder-[var(--input-placeholder)] ${theme.inputFocus} transition-all`,

    // Button patterns
    button: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200",
    buttonPrimary: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium ${theme.btnPrimary} transition-all duration-200`,
    buttonSecondary: `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium ${theme.btnSecondary} transition-all duration-200`,

    // Badge patterns
    badge: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",

    // Dropdown patterns
    dropdown: `${theme.elevatedBg} ${theme.borderLight} border rounded-xl shadow-xl`,
};

// Legacy colors export for backward compatibility
export const colors = {
    background: theme.pageGradient,
    cardBg: theme.cardBg,
    primary: theme.brandPrimary,
    accent: theme.borderDefault,
    destructive: theme.error,
    muted: theme.textTertiary,
    highlight: "bg-[var(--brand-primary-light)]",
};

export default theme;
