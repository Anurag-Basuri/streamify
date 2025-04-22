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
            width: "width",
            margin: "margin",
            transform: "transform",
        },
        transitionDuration: {
            200: "200ms",
        },
        transitionTimingFunction: {
            sidebar: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
        colors: {
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: "hsl(var(--primary))",
            "primary-hover": "hsl(var(--primary-hover))",
            destructive: "hsl(var(--destructive))",
            "destructive-hover": "hsl(var(--destructive-hover))",
            accent: "hsl(var(--accent))",
            muted: "hsl(var(--muted))",
        },
    },
    plugins: [],
};
