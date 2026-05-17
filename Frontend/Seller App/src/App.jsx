import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect, Component } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Transactions from "./pages/Transactions";
import Support from "./pages/Support";
import WeatherInsights from "./pages/WeatherInsights";
import MarketTrends from "./pages/MarketTrends";
import ForgotPassword from "./pages/ForgotPassword";
import DiseaseLab from "./pages/DiseaseLab";
import Logistics from "./pages/Logistics";
import AdminDash from "./pages/AdminDash";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { SocketProvider } from "@/context/SocketContext";

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
                            {this.state.error?.message || String(this.state.error)}
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
    const token = localStorage.getItem("sellerToken");
    if (!token) return <Navigate to="/" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("sellerToken");
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
};

const AppRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/listings" element={<ProtectedRoute><AppLayout><Listings /></AppLayout></ProtectedRoute>} />
                <Route path="/listings/new" element={<ProtectedRoute><AppLayout><CreateListing /></AppLayout></ProtectedRoute>} />
                <Route path="/listings/edit/:id" element={<ProtectedRoute><AppLayout><EditListing /></AppLayout></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><AppLayout><OrderDetails /></AppLayout></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><AppLayout><Transactions /></AppLayout></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><AppLayout><Support /></AppLayout></ProtectedRoute>} />
                <Route path="/dashboard/weather" element={<ProtectedRoute><AppLayout><WeatherInsights /></AppLayout></ProtectedRoute>} />
                <Route path="/dashboard/trends" element={<ProtectedRoute><AppLayout><MarketTrends /></AppLayout></ProtectedRoute>} />
                <Route path="/dashboard/disease-lab" element={<ProtectedRoute><AppLayout><DiseaseLab /></AppLayout></ProtectedRoute>} />
                <Route path="/dashboard/logistics" element={<ProtectedRoute><AppLayout><Logistics /></AppLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminDash /></AppLayout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AnimatePresence>
    );
};

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



    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <SocketProvider>
                        <Toaster />
                        <Sonner />
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                    </SocketProvider>
                </TooltipProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default App;
