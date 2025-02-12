import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
    return (
        <Router>
            <Header />
            <AppRoutes />
        </Router>
    );
}

export default App;
