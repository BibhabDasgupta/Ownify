import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid Token",
        description: "The reset link is invalid or expired"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match"
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters"
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword: password
      });
      setSuccess(true);
      toast({
        title: "Password Reset",
        description: "Your password has been updated successfully"
      });
    //   navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center pt-20 pb-16">
        <div className="w-full max-w-md px-4">
          {success ? (
            <div className="glass-card rounded-xl p-6 md:p-8 shadow-xl text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Password Updated!</h1>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset.
              </p>
              <p className="mb-6">
                Please return to the main website and log in with your new password.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/"}
              >
                Return to Home Page
              </Button>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 md:p-8 shadow-xl">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground">
                  Enter your new password below
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}