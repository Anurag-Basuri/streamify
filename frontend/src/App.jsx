import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
