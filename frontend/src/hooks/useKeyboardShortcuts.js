/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts for improved navigation
 */
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const useKeyboardShortcuts = (options = {}) => {
    const navigate = useNavigate();
    const {
        enableSearch = true,
        enableEscape = true,
        enableNavigation = true,
        onEscape,
        onSearch,
    } = options;

    const handleKeyDown = useCallback(
        (event) => {
            // Don't trigger shortcuts when typing in inputs
            const isInputFocused =
                document.activeElement.tagName === "INPUT" ||
                document.activeElement.tagName === "TEXTAREA" ||
                document.activeElement.isContentEditable;

            // Escape key - always works
            if (event.key === "Escape" && enableEscape) {
                if (onEscape) {
                    onEscape();
                } else {
                    // Blur any focused element
                    document.activeElement?.blur();
                }
                return;
            }

            // Skip other shortcuts if typing
            if (isInputFocused) return;

            // Search shortcut: "/" or Ctrl/Cmd + K
            if (enableSearch) {
                if (
                    event.key === "/" ||
                    ((event.metaKey || event.ctrlKey) && event.key === "k")
                ) {
                    event.preventDefault();
                    if (onSearch) {
                        onSearch();
                    } else {
                        // Focus search input
                        const searchInput = document.querySelector(
                            'input[type="search"], input[placeholder*="Search"]'
                        );
                        searchInput?.focus();
                    }
                    return;
                }
            }

            // Navigation shortcuts
            if (enableNavigation) {
                // Home: H
                if (event.key === "h" || event.key === "H") {
                    navigate("/");
                    return;
                }

                // Go back: Backspace (when not in input)
                if (event.key === "Backspace") {
                    navigate(-1);
                    return;
                }
            }
        },
        [
            enableSearch,
            enableEscape,
            enableNavigation,
            onEscape,
            onSearch,
            navigate,
        ]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Return utility functions
    return {
        focusSearch: () => {
            const searchInput = document.querySelector(
                'input[type="search"], input[placeholder*="Search"]'
            );
            searchInput?.focus();
        },
        blur: () => document.activeElement?.blur(),
    };
};

export default useKeyboardShortcuts;
