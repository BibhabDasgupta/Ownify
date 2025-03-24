import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Activity, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    setIsLoggedIn(!!token);

    if (token) {
      // Fetch user data from the backend
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const { name } = response.data;
          setUserName(name || "User");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User"); // Fallback name
        }
      };
      fetchUserData();
    } else {
      setUserName(""); // Reset name when not logged in
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    //localStorage.clear();
    localStorage.removeItem("user-profile");
    localStorage.removeItem("user-token");
    localStorage.removeItem("user-email");
    localStorage.removeItem("user-did");
    localStorage.removeItem("profile-completed");
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    navigate("/dashboard");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="page-container flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-all duration-300 hover:opacity-80"
        >
          <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-light">
            <div className="absolute w-5 h-5 rounded-full bg-primary/30"></div>
            <div className="absolute w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            ownify
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!isLandingPage && (
            <>
            <Link 
                to="/" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                className="text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              {isLoggedIn && (
                <Link 
                  to="/activity" 
                  className="text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </Link>
              )}
            </>
          )}
          <ThemeToggle />
          {!isLandingPage && !isLoggedIn && (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
          {!isLandingPage && isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <span>{userName || "User"}</span>
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogoutConfirm}
                  className="cursor-pointer text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-card py-4 animate-fade-in z-50">
          <nav className="flex flex-col space-y-4 px-6">
            <Link 
              to="/" 
              className="text-foreground/80 hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            {!isLandingPage && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isLoggedIn && (
                  <Link 
                    to="/activity" 
                    className="text-foreground/80 hover:text-foreground transition-colors py-2 flex items-center gap-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Activity className="h-4 w-4" /> Activity
                  </Link>
                )}
                {!isLoggedIn ? (
                  <Link 
                    to="/login" 
                    className="text-primary font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/profile" 
                      className="text-foreground/80 hover:text-foreground transition-colors py-2 flex items-center gap-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      className="text-destructive font-medium py-2 text-left flex items-center gap-1"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogoutConfirm();
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex items-center gap-1">
              <X className="h-4 w-4" /> No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 flex items-center gap-1">
              <Check className="h-4 w-4" /> Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
