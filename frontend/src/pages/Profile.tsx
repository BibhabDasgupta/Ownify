import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  did: z.string().min(1, { message: "DID is required" }),
});

type Profile = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      did: "",
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        // const email = localStorage.getItem("user-email") || ""; // Get email from login
        // if (!email) throw new Error("No email in localStorage");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API response:", response.data);
        const { name,email, phone, did } = response.data;
        const metamaskAddress = localStorage.getItem("user-did") || "";

        const profileData = {
          name: name || "",
          email: email || "",
          phone: phone || "",
          did: did || metamaskAddress || "",
        };

        form.reset(profileData);

        // Check if profile is complete
        const isProfileComplete = name && phone && did;
        console.log(isProfileComplete);
        setProfileCompleted(isProfileComplete);

        // If profile is complete, use localStorage if available and set editing to false
        const profileStatus = localStorage.getItem("profile-completed");
        // if (isProfileComplete && profileStatus === "true") {
        //   console.log("Profile complete, redirecting to /dashboard");
        //   navigate("/dashboard", { replace: true });
        //   return;
        // }
        
        if (profileStatus === "true") {
          setProfileCompleted(true);
          const savedProfile = localStorage.getItem("user-profile");
          if (savedProfile) {
            try {
              const localProfileData = JSON.parse(savedProfile);
              form.reset({
                name: localProfileData.name || name || "",
                email: localProfileData.email || email || "",
                phone: localProfileData.phone || phone || "",
                did: localProfileData.did || did || metamaskAddress || "",
              });
            } catch (e) {
              console.error("Error parsing profile data", e);
            }
          }
          setIsEditing(false); // View-only mode for completed profiles
        } else {
          setIsEditing(true); // Edit mode for incomplete profiles
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const metamaskAddress = localStorage.getItem("user-did");
        const savedProfile = localStorage.getItem("user-profile");

        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            form.reset({
              name: profileData.name || "",
              email: profileData.email || "",
              phone: profileData.phone || "",
              did: profileData.did || metamaskAddress || "",
            });
            setProfileCompleted(true);
            setIsEditing(false);
          } catch (e) {
            console.error("Error parsing profile data", e);
          }
        } else if (metamaskAddress) {
          form.reset({
            name: "",
            email: "",
            phone: "",
            did: metamaskAddress,
          });
          setIsEditing(true);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch profile data from server.",
          });
          navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [form, navigate, toast]);
  
  const onSubmit = async (data: Profile) => {
    setIsLoading(true);

    if (!data.name || !data.phone || !data.did) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
      });
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("user-token");
    try {
      // Send profile data to backend


      const profileData = {
        ...data,
        did: data.did.toLowerCase() // Ensure DID is lowercase
      };


      await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem("user-profile", JSON.stringify(profileData));
      localStorage.setItem("user-did", profileData.did);
      localStorage.setItem("profile-completed", "true");
      if (data.email) localStorage.setItem("user-email", profileData.email);// Store email for future use
      setProfileCompleted(true);
      setIsEditing(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    form.trigger().then((isValid) => {
      if (isValid && profileCompleted) {
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Incomplete profile",
          description: "Please fill in all required fields marked with *",
        });
      }
    });
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="page-container max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          {!profileCompleted && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Profile completion required:</strong> Please complete
                your profile information before continuing. Fields marked with *
                are required.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </div>
                {profileCompleted && !isEditing && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleEditMode}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                                required
                                readOnly={!isEditing && profileCompleted}
                                className={!isEditing && profileCompleted ? "bg-muted/50" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your email"
                                {...field}
                                type="email"
                                required
                                readOnly={!isEditing && profileCompleted}
                                className={!isEditing && profileCompleted ? "bg-muted/50" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your phone number"
                                {...field}
                                required
                                readOnly={!isEditing && profileCompleted}
                                className={!isEditing && profileCompleted ? "bg-muted/50" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="did"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DID (Decentralized Identifier) *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                readOnly={!isEditing && profileCompleted}
                                className={!isEditing && profileCompleted ? "bg-muted/50" : ""}
                                placeholder="Enter your DID (Case Insensitive)"
                                required
                              />
                            </FormControl> 
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4">
                      {isEditing ? (
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      ) : (
                        profileCompleted && (
                          <Button type="button" variant="outline" onClick={handleGoToDashboard}>
                            Go to Dashboard
                          </Button>
                        )
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Device Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered Devices</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified Transfers</span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Enable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}