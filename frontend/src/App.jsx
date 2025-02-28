import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <AuthProvider>
            {" "}
            {/* ✅ Router is removed */}
            <div className="flex min-h-screen bg-[#0D0D1A]">
                {/* Sidebar */}
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                {/* Main Content */}
                <div className="flex-1">
                    <Header
                        toggleSidebar={toggleSidebar}
                        isSidebarOpen={isSidebarOpen}
                    />
                    <main
                        className={`pt-16 transition-all duration-300 ${
                            isSidebarOpen ? "md:ml-64" : "md:ml-20"
                        }`}
                    >
                        <div className="p-4 sm:p-6 lg:p-8">
                            <AppRoutes />
                        </div>
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}

export default App;
