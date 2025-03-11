import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Detect mobile devices and handle resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) setIsSidebarOpen(false);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // YouTube-like sidebar behavior
    const sidebarState = isMobile ? isSidebarOpen : isHovered || isSidebarOpen;

    return (
        <AuthProvider>
            <div className="flex min-h-screen bg-[#0D0D1A] relative">
                {/* Dynamic Sidebar */}
                <div
                    className={`hidden md:block fixed inset-y-0 z-30 ${
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

                {/* Mobile Sidebar Overlay */}
                {isMobile && (
                    <Sidebar
                        isOpen={isSidebarOpen}
                        toggleSidebar={setIsSidebarOpen}
                        isMobile={isMobile}
                    />
                )}

                {/* Main Content Area */}
                <div
                    className={`flex-1 transition-all duration-300 ${
                        !isMobile ? (sidebarState ? "ml-64" : "ml-20") : ""
                    }`}
                >
                    <Header
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        isSidebarOpen={isSidebarOpen}
                    />

                    {/* Content Container */}
                    <main className="pt-16">
                        <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
                            <AppRoutes />
                        </div>
                    </main>
                </div>

                {/* Mobile Overlay Backdrop */}
                {isMobile && isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>
        </AuthProvider>
    );
}

export default App;
