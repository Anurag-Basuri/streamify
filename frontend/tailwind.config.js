/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        screens: {
            xs: "480px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
        },
    },
    extend: {
        transitionProperty: {
            margin: "margin",
            width: "width",
        },
        transitionDuration: {
            200: "200ms",
        },
        transitionTimingFunction: {
            "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        },
    },
    plugins: [],
};
