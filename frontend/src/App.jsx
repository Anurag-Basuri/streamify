import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const sidebarState = isMobile ? isSidebarOpen : isHovered || isSidebarOpen;

    return (
        <AuthProvider>
            <div className="flex min-h-screen bg-[#0D0D1A] relative">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div
                        className={`fixed inset-y-0 z-30 transition-all duration-200 ${
                            isMobile ? "" : "hoverable-sidebar"
                        }`}
                        onMouseEnter={() => !isMobile && setIsHovered(true)}
                        onMouseLeave={() => !isMobile && setIsHovered(false)}
                    >
                        <Sidebar
                            isOpen={sidebarState}
                            toggleSidebar={setIsSidebarOpen}
                            isMobile={isMobile}
                        />
                    </div>
                )}

                {/* Main Content */}
                <div
                    className={`flex-1 transition-[margin] duration-200 ease-in-out ${
                        !isMobile
                            ? sidebarState
                                ? "ml-[240px]"
                                : "ml-[72px]"
                            : ""
                    }`}
                >
                    <Header
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        isSidebarOpen={isSidebarOpen}
                    />

                    <main className="pt-16">
                        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                            <AppRoutes />
                        </div>
                    </main>
                </div>

                {/* Mobile Sidebar and Overlay */}
                {isMobile && (
                    <>
                        <Sidebar
                            isOpen={isSidebarOpen}
                            toggleSidebar={setIsSidebarOpen}
                            isMobile={isMobile}
                        />
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    key="overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                    onClick={() => setIsSidebarOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </AuthProvider>
    );
}

export default App;
