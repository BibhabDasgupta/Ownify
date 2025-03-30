import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      // Add other methods/properties you use (optional)
    };
  }
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Login() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Login request
      const loginResponse = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );
      const { token } = loginResponse.data;

      // Store token and email
      localStorage.setItem("user-token", token);
      localStorage.setItem("user-email", values.email);

      // Check profile completeness
      const profileResponse = await axios.get(
        `http://localhost:5000/api/auth/check-email/${values.email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(profileResponse);
      const { name, phone, did } = profileResponse.data;
      localStorage.setItem("user-did", did);

      // Check if all required fields are present and non-empty
      const isProfileComplete = name && phone && did && values.email;

      if (isProfileComplete) {
        localStorage.setItem("profile-completed", "true");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        localStorage.removeItem("profile-completed");
        toast({
          title: "Login successful",
          description: "Welcome back! Please complete your profile.",
        });
        navigate("/profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const signupData = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      await axios.post("http://localhost:5000/api/auth/signup", signupData);
      localStorage.setItem("user-email", values.email);
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      setTab("login");
      signupForm.reset();
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetamaskLogin = async () => {
    setIsLoading(true);
    setError(null);

    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      // Create a message to sign
      const message = `Sign this message to authenticate with Ownify: ${address}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      // Send to backend
      const response = await axios.post("http://localhost:5000/api/auth/metamask", {
        address,
        signature,
        message,
      });
      const { token, redirectPath } = response.data;
      //console.log(redirectPath);

      localStorage.setItem("user-token", token);
      localStorage.setItem("user-did", address);
      localStorage.setItem("profile-completed", redirectPath === "/dashboard" ? "true" : "false");// Placeholder, updated in profile if needed

      toast({
        title: "MetaMask login successful",
        description: redirectPath === "/dashboard" ? "Welcome back!" : "Please complete your profile.",
      });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("MetaMask login error:", err);
      toast({
        variant: "destructive",
        title: "MetaMask Login Failed",
        description: err.response?.data?.message || "Failed to authenticate with MetaMask.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    console.log("Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=1094272256203-5fappmfun2i62sml4g13asm8aq07bfe2.apps.googleusercontent.com&redirect_uri=http://localhost:8080/auth/google/callback&response_type=token&scope=email%20profile`;
    const popup = window.open(
      googleAuthUrl,
      "google-auth",
      `width=500,height=600,top=${(window.screen.height - 600) / 2},left=${(window.screen.width - 500) / 2}`
    );
  
    if (!popup) {
      toast({
        variant: "destructive",
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again.",
      });
      setIsLoading(false);
      return;
    }
  
    const handleMessage = async (event) => {
      if (event.origin !== "http://localhost:8080") return;
  
      console.log("Received message from popup:", event.data);
  
      // Only process messages with a 'type' field related to Google auth
      if (!event.data || typeof event.data !== "object" || !event.data.type) {
        console.log("Ignoring non-Google auth message:", event.data);
        return; // Ignore MetaMask or other unrelated messages
      }
  
      window.removeEventListener("message", handleMessage);
      setIsLoading(false);
  
    //   if (event.data.type === "google-auth-complete") {
    //     const redirectPath = event.data.redirect || "/profile";
    //     console.log("Redirecting to:", redirectPath);
    //     toast({
    //       title: "Google login successful",
    //       description: redirectPath === "/dashboard" ? "Welcome back!" : "Please complete your profile.",
    //     });
    //     navigate(redirectPath, { replace: true });
    //   } else if (event.data.type === "google-auth-failed") {
    //     toast({
    //       variant: "destructive",
    //       title: "Google login failed",
    //       description: event.data.message || "Authentication was not completed.",
    //     });
    //   } else {
    //     console.error("Unexpected Google auth message:", event.data);
    //     toast({
    //       variant: "destructive",
    //       title: "Unknown Error",
    //       description: "Unexpected response from authentication process.",
    //     });
    //   }
    // };
    if (event.data.type === "google-auth-complete") {
      try {
        const token = localStorage.getItem("user-token");
        if (!token) throw new Error("No authentication token found");

        // Fetch user data
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { did, name, email, phone } = response.data;

        // Update localStorage
        if (did) localStorage.setItem("user-did", did.toLowerCase());
        if (email) localStorage.setItem("user-email", email);

        // Determine profile completion
        const isProfileComplete = name && email && phone && did;
        localStorage.setItem("profile-completed", isProfileComplete ? "true" : "false");

        // Redirect based on completion status
        navigate(isProfileComplete ? "/dashboard" : "/profile", { replace: true });

        toast({
          title: "Login successful",
          description: isProfileComplete 
            ? "Welcome back!" 
            : "Please complete your profile",
        });

      } catch (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "Could not verify your account. Please try again.",
        });
        navigate("/login");
      }
    } else if (event.data.type === "google-auth-failed") {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: event.data.message || "Authentication failed",
      });
    }
  };
  
    window.addEventListener("message", handleMessage);
  };
  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center pt-20 pb-16">
        <div className="w-full max-w-md px-4">
          <div className="glass-card rounded-xl p-6 md:p-8 shadow-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Welcome to Ownify</h1>
              <p className="text-muted-foreground">
                {tab === "login"
                  ? "Sign in to continue"
                  : "Create your account"}
              </p>
            </div>

            <Tabs
              defaultValue="login"
              value={tab}
              onValueChange={(v) => setTab(v as "login" | "signup")}
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between items-center text-sm">
                      <Link to="#" className="text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={handleGoogleLogin}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={handleMetamaskLogin}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.9 12.5c0-3.8-3.1-6.9-6.9-6.9s-6.9 3.1-6.9 6.9c0 1.5.5 3 1.4 4.2l-.5 2.3L11.3 21l1.4-2.3c.8.4 1.8.6 2.7.6 3.8 0 6.9-3.1 6.9-6.8z"></path>
                        <path d="M5.6 12h.01"></path>
                        <path d="M19.5 12h.01"></path>
                        <path d="M12.5 1.8v10.3"></path>
                      </svg>
                      Metamask
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signupForm}>
                  <form
                    onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your name"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Create a password"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="password"
                                placeholder="Confirm your password"
                                className="pl-9"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={handleGoogleLogin}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={handleMetamaskLogin}
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.9 12.5c0-3.8-3.1-6.9-6.9-6.9s-6.9 3.1-6.9 6.9c0 1.5.5 3 1.4 4.2l-.5 2.3L11.3 21l1.4-2.3c.8.4 1.8.6 2.7.6 3.8 0 6.9-3.1 6.9-6.8z"></path>
                        <path d="M5.6 12h.01"></path>
                        <path d="M19.5 12h.01"></path>
                        <path d="M12.5 1.8v10.3"></path>
                      </svg>
                      Metamask
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
