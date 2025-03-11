import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";
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

        const header = document.querySelector('header');
        if (header) setHeaderHeight(header.offsetHeight);

        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const sidebarWidth = isMobile ? 256 : isSidebarOpen ? 240 : 72;

    return (
        <AuthProvider>
            <div className="min-h-screen bg-[#0D0D1A] relative">
                {/* Header */}
                <Header
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
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
                    <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                        <AppRoutes />
                    </div>
                </div>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {isMobile && (
                        <motion.div
                            className="fixed top-0 left-0 right-0 bottom-0 z-50" // Increased z-index
                            initial={{ x: "-100%" }}
                            animate={{ x: isSidebarOpen ? 0 : "-100%" }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.2 }}
                            style={{ top: headerHeight }} // Start below header
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
                            className="fixed inset-0 bg-black/50 z-40" // Adjusted z-index
                            onClick={() => setIsSidebarOpen(false)}
                            style={{ top: headerHeight }} // Start below header
                        />
                    )}
                </AnimatePresence>
            </div>
        </AuthProvider>
    );
}

export default App;