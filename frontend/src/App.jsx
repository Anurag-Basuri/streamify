import { useState, useEffect, useCallback } from "react";
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
import { showInfo } from "./components/Common/ToastProvider";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

const HEADER_HEIGHT = 64;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 240;
const MOBILE_SIDEBAR_WIDTH = 280;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Breakpoint helpers
    const isMobile = windowWidth < MOBILE_BREAKPOINT;
    const isTablet =
        windowWidth >= MOBILE_BREAKPOINT && windowWidth < TABLET_BREAKPOINT;
    const isDesktop = windowWidth >= TABLET_BREAKPOINT;

    // Calculate sidebar width based on state
    const sidebarWidth = isMobile
        ? MOBILE_SIDEBAR_WIDTH
        : isSidebarOpen || isSidebarPinned
        ? SIDEBAR_EXPANDED_WIDTH
        : SIDEBAR_COLLAPSED_WIDTH;

    // Handle resize with debounce
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setWindowWidth(window.innerWidth);
                // Reset sidebar on mobile
                if (window.innerWidth < MOBILE_BREAKPOINT) {
                    setIsSidebarOpen(false);
                    setIsSidebarPinned(false);
                }
            }, 100);
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // Handle notification toasts
    useEffect(() => {
        const handleNewNotification = (event) => {
            const notification = event.detail;
            if (notification?.message) {
                showInfo(notification.message, {
                    icon: (
                        <Bell
                            size={18}
                            className="text-[var(--brand-primary)]"
                        />
                    ),
                    duration: 4000,
                });
            }
        };

        window.addEventListener("notification:received", handleNewNotification);
        return () =>
            window.removeEventListener(
                "notification:received",
                handleNewNotification
            );
    }, []);

    // Toggle sidebar (different behavior for mobile vs desktop)
    const toggleSidebar = useCallback(() => {
        if (isMobile) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsSidebarPinned(!isSidebarPinned);
        }
    }, [isMobile, isSidebarOpen, isSidebarPinned]);

    // Close mobile sidebar
    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <NotificationProvider>
                    {/* Root container */}
                    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
                        {/* Fixed Header */}
                        <Header
                            toggleSidebar={toggleSidebar}
                            isSidebarOpen={isSidebarOpen || isSidebarPinned}
                            sidebarWidth={isMobile ? 0 : sidebarWidth}
                            isMobile={isMobile}
                        />

                        {/* Desktop/Tablet Sidebar - Fixed position */}
                        {!isMobile && (
                            <aside
                                className="fixed left-0 z-30 transition-all duration-200 ease-in-out"
                                style={{
                                    top: HEADER_HEIGHT,
                                    bottom: 0,
                                    width: sidebarWidth,
                                }}
                                onMouseEnter={() =>
                                    !isSidebarPinned && setIsSidebarOpen(true)
                                }
                                onMouseLeave={() =>
                                    !isSidebarPinned && setIsSidebarOpen(false)
                                }
                            >
                                <Sidebar
                                    isOpen={isSidebarOpen || isSidebarPinned}
                                    toggleSidebar={toggleSidebar}
                                    isMobile={false}
                                    isPinned={isSidebarPinned}
                                />
                            </aside>
                        )}

                        {/* Main Content Area */}
                        <main
                            className="relative transition-all duration-200 ease-in-out"
                            style={{
                                marginLeft: isMobile ? 0 : sidebarWidth,
                                paddingTop: HEADER_HEIGHT,
                            }}
                        >
                            {/* Content Container with responsive padding */}
                            <div className="min-h-[calc(100vh-64px)]">
                                <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
                                    <div className="mx-auto max-w-[1800px]">
                                        <AppRoutes />
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* Mobile Sidebar Drawer */}
                        <AnimatePresence>
                            {isMobile && isSidebarOpen && (
                                <>
                                    {/* Backdrop */}
                                    <motion.div
                                        key="mobile-backdrop"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                                        style={{ top: HEADER_HEIGHT }}
                                        onClick={closeSidebar}
                                        aria-label="Close sidebar"
                                    />

                                    {/* Sidebar Panel */}
                                    <motion.aside
                                        key="mobile-sidebar"
                                        initial={{ x: "-100%" }}
                                        animate={{ x: 0 }}
                                        exit={{ x: "-100%" }}
                                        transition={{
                                            type: "spring",
                                            damping: 25,
                                            stiffness: 300,
                                        }}
                                        className="fixed left-0 z-50 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] shadow-2xl"
                                        style={{
                                            top: HEADER_HEIGHT,
                                            bottom: 0,
                                            width: MOBILE_SIDEBAR_WIDTH,
                                        }}
                                    >
                                        <Sidebar
                                            isOpen={true}
                                            toggleSidebar={closeSidebar}
                                            isMobile={true}
                                        />
                                    </motion.aside>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Quick Actions FAB - Hidden on very small screens */}
                        <div className="hidden xs:block">
                            <QuickActions />
                        </div>

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
