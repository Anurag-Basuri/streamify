/**
 * useLocalStorage Hook
 * Persists state in localStorage with automatic serialization
 */
import { useState, useEffect, useCallback } from "react";

/**
 * State that persists in localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if not in storage
 * @returns {[any, Function, Function]} [value, setValue, clearValue]
 */
const useLocalStorage = (key, initialValue) => {
    // Get initial value from localStorage or use provided initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when value changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Clear value from storage
    const clearValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setStoredValue, clearValue];
};

export default useLocalStorage;
