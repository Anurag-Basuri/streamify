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
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                accent: "var(--accent)",
                border: "var(--border)",
                "muted-foreground": "var(--muted-foreground)",
                popover: "var(--popover)",
                "popover-foreground": "var(--popover-foreground)",
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
                float: {
                    "0%, 100%": { transform: "translateY(0) scale(1)" },
                    "50%": { transform: "translateY(-10px) scale(1.01)" },
                },
                slideUp: {
                    "0%": { transform: "translateY(100px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                fadeInUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-500px 0" },
                    "100%": { transform: "translateX(100%)" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.9)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                slideInBottom: {
                    "0%": { transform: "translateY(30px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                spotlight: {
                    "0%": {
                        opacity: 0,
                        transform: "translate(-72%, -62%) scale(0.5)",
                    },
                    "100%": {
                        opacity: 1,
                        transform: "translate(-50%,-40%) scale(1)",
                    },
                },
                bounce: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-6px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.2s ease-out",
                "fade-out": "fade-out 0.2s ease-out",
                "slide-in": "slide-in 0.2s ease-out",
                "slide-out": "slide-out 0.2s ease-out",
                float: "float 4s ease-in-out infinite",
                "float-delay": "float 6s ease-in-out infinite 1.5s",
                "slide-up": "slideUp 0.5s ease-out",
                "fade-in-up": "fadeInUp 0.5s ease-out",
                shimmer: "shimmer 3s linear infinite",
                scaleIn: "scaleIn 0.2s ease-out",
                slideInBottom: "slideInBottom 0.3s ease-out",
                spotlight: "spotlight 2s ease .75s 1 forwards",
                "shimmer-once": "shimmer 2s ease-in-out 1",
                bounce: "bounce 1.5s infinite",
                "bounce-delay": "bounce 1.5s infinite 0.2s",
                "bounce-double-delay": "bounce 1.5s infinite 0.4s",
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
            backgroundImage: {
                "auth-pattern": "url('/auth-pattern.svg')",
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
