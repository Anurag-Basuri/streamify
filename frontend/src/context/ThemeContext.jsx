/**
 * Theme Context
 * Centralized theme management with React Context API
 */
import { createContext, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Theme options
export const THEMES = {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
};

// Create the context
const ThemeContext = createContext(null);

/**
 * Detects system color scheme preference
 */
const getSystemTheme = () => {
    if (typeof window === "undefined") return THEMES.DARK;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEMES.DARK
        : THEMES.LIGHT;
};

/**
 * Gets the initial theme from localStorage or system preference
 */
const getInitialTheme = () => {
    if (typeof window === "undefined") return THEMES.DARK;

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme;
    }

    // Default to system preference
    return THEMES.SYSTEM;
};

/**
 * Theme Provider Component
 * Provides theme state and controls to the entire app
 */
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);
    const [resolvedTheme, setResolvedTheme] = useState(() => {
        const initial = getInitialTheme();
        return initial === THEMES.SYSTEM ? getSystemTheme() : initial;
    });

    /**
     * Apply theme to document and update resolved theme
     */
    const applyTheme = useCallback((newTheme) => {
        const root = document.documentElement;
        const actualTheme =
            newTheme === THEMES.SYSTEM ? getSystemTheme() : newTheme;

        // Remove existing theme classes
        root.classList.remove(THEMES.LIGHT, THEMES.DARK);

        // Add new theme class
        root.classList.add(actualTheme);

        // Update resolved theme
        setResolvedTheme(actualTheme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
        );
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                "content",
                actualTheme === THEMES.DARK ? "#0f172a" : "#f8fafc"
            );
        }
    }, []);

    /**
     * Set and persist theme
     */
    const setThemeAndPersist = useCallback(
        (newTheme) => {
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
            applyTheme(newTheme);
        },
        [applyTheme]
    );

    /**
     * Toggle between light and dark (ignores system)
     */
    const toggleTheme = useCallback(() => {
        const newTheme =
            resolvedTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setThemeAndPersist(newTheme);
    }, [resolvedTheme, setThemeAndPersist]);

    /**
     * Set to light theme
     */
    const setLight = useCallback(() => {
        setThemeAndPersist(THEMES.LIGHT);
    }, [setThemeAndPersist]);

    /**
     * Set to dark theme
     */
    const setDark = useCallback(() => {
        setThemeAndPersist(THEMES.DARK);
    }, [setThemeAndPersist]);

    /**
     * Set to system theme
     */
    const setSystem = useCallback(() => {
        setThemeAndPersist(THEMES.SYSTEM);
    }, [setThemeAndPersist]);

    // Apply theme on mount
    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    // Listen for system theme changes when using system theme
    useEffect(() => {
        if (theme !== THEMES.SYSTEM) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = () => {
            applyTheme(THEMES.SYSTEM);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, applyTheme]);

    const value = {
        theme, // Current theme setting (light/dark/system)
        resolvedTheme, // Actual applied theme (light/dark)
        isDark: resolvedTheme === THEMES.DARK,
        isLight: resolvedTheme === THEMES.LIGHT,
        isSystem: theme === THEMES.SYSTEM,
        toggleTheme,
        setTheme: setThemeAndPersist,
        setLight,
        setDark,
        setSystem,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { ThemeContext };
export default ThemeContext;
