
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

const queryClient = new QueryClient();

// Modified ProtectedRoute component that allows direct dashboard access
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem("user-token");
  const profileCompleted = localStorage.getItem("profile-completed") === "true";
  const location = useLocation();
  
  useEffect(() => {
    if (isLoggedIn && !profileCompleted && location.pathname !== "/profile") {
      toast.error("Profile completion required", {
        description: "Please complete your profile before accessing other pages."
      });
    }
  }, [isLoggedIn, profileCompleted, location.pathname]);
  
  // Allow access to the dashboard without login checks
  if (location.pathname === "/dashboard") {
    return element;
  }
  
  // Normal login protection for other routes
  if (!isLoggedIn) {
    toast.error("Need login to proceed", {
      description: "Please log in to proceed.",
      style: {
        backgroundColor: "#800000",
        color: "white",
        border: "1px solid darkred",
      },
    });
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isLoggedIn && !profileCompleted && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }
  
  return element;
};

const IndexRoute = ({ element }: { element: JSX.Element }) => {
  return element;
};

// Login redirect component
const LoginRedirect = ({ element }: { element: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem("user-token");
  
  if (isLoggedIn) {
    const profileCompleted = localStorage.getItem("profile-completed") === "true";
    if (!profileCompleted) {
      return <Navigate to="/profile" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return element;
};

// Profile route handler
const ProfileRoute = ({ element }: { element: JSX.Element }) => {
  const isLoggedIn = !!localStorage.getItem("user-token");
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");

      if (accessToken) {
        try {
          const response = await axios.post("http://localhost:5000/api/auth/google", { accessToken });
          const { token, email } = response.data;

          localStorage.setItem("user-token", token);
          localStorage.setItem("user-email", email);

          const profileResponse = await axios.get(
            `http://localhost:5000/api/auth/check-email/${email}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const { name, phone, did } = profileResponse.data;
          const isProfileComplete = name && phone && did && email;

          const message = {
            type: "google-auth-complete",
            redirect: isProfileComplete ? "/dashboard" : "/profile",
          };
          console.log("Sending message from popup:", message); // Debug payload

          if (isProfileComplete) {
            localStorage.setItem("profile-completed", "true");
          } else {
            localStorage.removeItem("profile-completed");
          }

          window.opener.postMessage(message, "http://localhost:8080");
          window.history.replaceState({}, document.title, "/login");
          setTimeout(() => window.close(), 100); // Ensure message is sent before closing
        } catch (error) {
          console.error("Google auth error in callback:", error);
          const errorMessage = {
            type: "google-auth-failed",
            message: error.response?.data?.message || "Authentication failed",
          };
          console.log("Sending error message from popup:", errorMessage);
          window.opener.postMessage(errorMessage, "http://localhost:8080");
          setTimeout(() => window.close(), 100);
        }
      } else {
        console.error("No access token found in URL hash");
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<IndexRoute element={<Index />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfileRoute element={<Profile />} />} />
          <Route path="/activity" element={<ProtectedRoute element={<Activity />} />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} /> {/* New route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
