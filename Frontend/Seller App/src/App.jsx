import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import LanguageOnboarding from "@/components/LanguageOnboarding";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Support from "./pages/Support";
import WeatherInsights from "./pages/WeatherInsights";
import MarketTrends from "./pages/MarketTrends";
import AuthLanding from "./pages/AuthLanding";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import DiseaseLab from "./pages/DiseaseLab";
import Logistics from "./pages/Logistics";
import AdminDash from "./pages/AdminDash";
import NotFound from "./pages/NotFound";

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

    const [showOnboarding, setShowOnboarding] = useState(() => {
        return !localStorage.getItem("onboarding_complete");
    });

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                {showOnboarding && (
                    <LanguageOnboarding onComplete={() => setShowOnboarding(false)} />
                )}
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<PublicRoute><AuthLanding /></PublicRoute>} />
                        <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/auth/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                        <Route path="/listings" element={<ProtectedRoute><AppLayout><Listings /></AppLayout></ProtectedRoute>} />
                        <Route path="/listings/new" element={<ProtectedRoute><AppLayout><CreateListing /></AppLayout></ProtectedRoute>} />
                        <Route path="/listings/edit/:id" element={<ProtectedRoute><AppLayout><EditListing /></AppLayout></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><AppLayout><Orders /></AppLayout></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><AppLayout><OrderDetails /></AppLayout></ProtectedRoute>} />
                        <Route path="/support" element={<ProtectedRoute><AppLayout><Support /></AppLayout></ProtectedRoute>} />
                        <Route path="/dashboard/weather" element={<ProtectedRoute><AppLayout><WeatherInsights /></AppLayout></ProtectedRoute>} />
                        <Route path="/dashboard/trends" element={<ProtectedRoute><AppLayout><MarketTrends /></AppLayout></ProtectedRoute>} />
                        <Route path="/dashboard/disease-lab" element={<ProtectedRoute><AppLayout><DiseaseLab /></AppLayout></ProtectedRoute>} />
                        <Route path="/dashboard/logistics" element={<ProtectedRoute><AppLayout><Logistics /></AppLayout></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminDash /></AppLayout></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

export default App;
