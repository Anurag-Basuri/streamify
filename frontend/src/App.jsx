import { BrowserRouter as Router } from "react-router-dom";
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
            <Router>
                <div className="flex min-h-screen bg-gray-900">
                    {/* Sidebar */}
                    <Sidebar
                        isOpen={isSidebarOpen}
                        toggleSidebar={toggleSidebar}
                    />

                    {/* Main Content */}
                    <div className="flex-1">
                        <Header toggleSidebar={toggleSidebar} />
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
            </Router>
        </AuthProvider>
    );
}

export default App;