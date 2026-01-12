import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import {
    ToastProvider,
    QuickActions,
    GuestSignupBanner,
} from "./components/Common";
import { AnimatePresence, motion } from "framer-motion";

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [headerHeight, setHeaderHeight] = useState(64);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };

        const header = document.querySelector("header");
        if (header) setHeaderHeight(header.offsetHeight);

        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const sidebarWidth = isMobile ? 256 : isSidebarOpen ? 240 : 72;

    return (
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    {/* Root container with theme background */}
                    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
                        {/* Header */}
                        <Header
                            toggleSidebar={() =>
                                setIsSidebarOpen(!isSidebarOpen)
                            }
                            isSidebarOpen={isSidebarOpen}
                            sidebarWidth={sidebarWidth}
                            isMobile={isMobile}
                        />

                        {/* Desktop Sidebar */}
                        {!isMobile && (
                            <div
                                className="fixed top-0 z-30"
                                style={{
                                    top: headerHeight,
                                    bottom: 0,
                                    width: sidebarWidth,
                                }}
                                onMouseEnter={() => setIsSidebarOpen(true)}
                                onMouseLeave={() => setIsSidebarOpen(false)}
                            >
                                <Sidebar
                                    isOpen={isSidebarOpen}
                                    toggleSidebar={setIsSidebarOpen}
                                    isMobile={isMobile}
                                />
                            </div>
                        )}

                        {/* Main Content */}
                        <div
                            className="relative transition-all duration-200 ease-in-out"
                            style={{
                                marginLeft: isMobile ? 0 : sidebarWidth,
                                paddingTop: headerHeight,
                                minHeight: `calc(100vh - ${headerHeight}px)`,
                            }}
                        >
                            <main className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                                <AppRoutes />
                            </main>
                        </div>

                        {/* Mobile Sidebar */}
                        <AnimatePresence>
                            {isMobile && (
                                <motion.div
                                    className="fixed top-0 left-0 right-0 bottom-0 z-50"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: isSidebarOpen ? 0 : "-100%" }}
                                    exit={{ x: "-100%" }}
                                    transition={{
                                        type: "tween",
                                        duration: 0.2,
                                    }}
                                    style={{ top: headerHeight }}
                                >
                                    <Sidebar
                                        isOpen={isSidebarOpen}
                                        toggleSidebar={setIsSidebarOpen}
                                        isMobile={isMobile}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile Overlay */}
                        <AnimatePresence>
                            {isMobile && isSidebarOpen && (
                                <motion.div
                                    key="overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-40"
                                    onClick={() => setIsSidebarOpen(false)}
                                    style={{ top: headerHeight }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Quick Actions FAB */}
                        <QuickActions />

                        {/* Guest Signup Banner */}
                        <GuestSignupBanner />
                    </div>

                    {/* Toast Notifications */}
                    <ToastProvider />
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
