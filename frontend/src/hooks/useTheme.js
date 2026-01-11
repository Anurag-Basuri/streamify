/**
 * useTheme Hook
 * Access theme context with helpful utilities
 */
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
 * @throws {Error} If used outside ThemeProvider
 */
const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used within a ThemeProvider. " +
                "Make sure you have wrapped your app with <ThemeProvider>."
        );
    }

    return context;
};

export default useTheme;
