import { createContext } from "react";
import PropTypes from "prop-types";
import useThemeSetup from "../hooks/useThemeSetup";

// Create the context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
    const themeValue = useThemeSetup();

    return (
        <ThemeContext.Provider value={themeValue}>
            {children}
        </ThemeContext.Provider>
    );
};

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Export the context for direct usage if needed
export { ThemeContext };
