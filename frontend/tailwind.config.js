/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        screens: {
            xs: "480px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "2rem",
                lg: "4rem",
                xl: "5rem",
                "2xl": "6rem",
            },
        },
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    hover: "hsl(var(--primary-hover))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    hover: "hsl(var(--destructive-hover))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "fade-out": {
                    from: { opacity: "1" },
                    to: { opacity: "0" },
                },
                "slide-in": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                "slide-out": {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-100%)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.2s ease-out",
                "fade-out": "fade-out 0.2s ease-out",
                "slide-in": "slide-in 0.2s ease-out",
                "slide-out": "slide-out 0.2s ease-out",
            },
            transitionProperty: {
                width: "width",
                margin: "margin",
                transform: "transform",
                height: "height",
                spacing: "margin, padding",
                opacity: "opacity",
                background: "background-color",
            },
            transitionDuration: {
                200: "200ms",
                300: "300ms",
                400: "400ms",
                500: "500ms",
            },
            transitionTimingFunction: {
                sidebar: "cubic-bezier(0.4, 0, 0.2, 1)",
                smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
                bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            },
            boxShadow: {
                card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "card-hover":
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            zIndex: {
                header: "100",
                sidebar: "200",
                modal: "300",
                toast: "400",
                tooltip: "500",
            },
        },
    },
    plugins: [],
};
