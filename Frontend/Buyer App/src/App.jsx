import { useState, useEffect, Component } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import Orders from "@/pages/Orders";
import Transactions from "@/pages/Transactions";
import NotFound from "@/pages/NotFound";
import LanguageOnboarding from "@/components/LanguageOnboarding";
import DemandAnalytics from "@/pages/DemandAnalytics";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
                    <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl border border-red-200">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
                        <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-64 mb-4 text-gray-700">
                            {this.state.error?.message}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const AppRoutes = () => (
    <>
        <Navbar />
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/intelligence" element={<ProtectedRoute><DemandAnalytics /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </>
);

const App = () => {
    useEffect(() => {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else if (theme === "light") {
            document.documentElement.classList.remove("dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark");
        }
    }, []);

    const [showOnboarding, setShowOnboarding] = useState(false);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    {showOnboarding && (
                        <LanguageOnboarding onComplete={() => setShowOnboarding(false)} />
                    )}
                    <AuthProvider>
                        <BrowserRouter>
                            <AppRoutes />
                        </BrowserRouter>
                    </AuthProvider>
                </TooltipProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
