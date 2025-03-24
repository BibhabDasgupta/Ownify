import { useState, useEffect } from "react";
import { Shield, Search, FileCheck, AlertTriangle, X, MessageCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import FeatureCard from "@/components/FeatureCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";


export default function Dashboard() {
  const [activeDialog, setActiveDialog] = useState<
    "verification" | "checking" | "registration" | null
  >(null);
  const [showMessages, setShowMessages] = useState(false);
  //const [isLoggedIn, setIsLoggedIn] = useState(false);
  //const [profileCompleted, setProfileCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLoggedIn = () => !!localStorage.getItem("user-token");
  const isProfileCompleted = () => localStorage.getItem("profile-completed") === "true";

  useEffect(() => {
  //   const token = localStorage.getItem("user-token");
  //   setIsLoggedIn(!!token);
    
  //   const profileStatus = localStorage.getItem("profile-completed");
  //   setProfileCompleted(profileStatus === "true");
    
  //   if (token && profileStatus !== "true") {
  //     navigate("/profile");
  //   }
  // }, [navigate]);

  if (isLoggedIn() && !isProfileCompleted()) {
    navigate("/profile");
  }
}, [navigate]);

  const handleOpenVerification = () => {
    setActiveDialog("verification");
  };

  const handleOpenChecking = () => {
    setActiveDialog("checking");
  };

  const handleOpenRegistration = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in for registration",
        variant: "destructive",
        duration: 5000
      });
      return;
    }
    setActiveDialog("registration");
  };
  
  const handleOpenMessages = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in to open messages",
        variant: "destructive",
        duration: 5000
      });
      return;
    }
    setShowMessages(true);
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  const handleActivityClick = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in to view your activity log",
        variant: "destructive",
        duration: 5000
      });
      
      
      return;
    }
    
    navigate("/activity");
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 relative">
        <div className="page-container">
          <div className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Device Management</h1>
              <p className="text-muted-foreground text-lg">
                Verify, check or register your devices securely with blockchain technology.
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleActivityClick}>
              <Activity className="h-4 w-4" />
              Activity Log
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Verification"
              description="Verify the ownership of a device using DID and Device ID with cryptographic proof."
              action="Verify Device"
              color="bg-blue-500"
              onClick={handleOpenVerification}
              imageSrc="/public/uploads/ver-Photoroom.jpg"
              infoContent={
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Device verification allows you to confirm the ownership of a device based on
                    the provided DID (Decentralized Identifier) and Device ID.
                  </p>
                  <p>
                    The system will check for a valid ownership record on the blockchain and
                    verify the cryptographic signature.
                  </p>
                  <p>
                    This process is essential for validating authentic ownership during device
                    transfers or second-hand purchases.
                  </p>
                </div>
              }
            />

            <FeatureCard
              icon={<Search className="h-6 w-6 text-white" />}
              title="Checking"
              description="Check if a device is registered and view ownership details without verification."
              action="Check Device"
              color="bg-purple-500"
              onClick={handleOpenChecking}
              imageSrc="/public/uploads/checkedd-Photoroom.jpg"
              infoContent={
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Device checking allows you to query a device's registration status by
                    entering its unique Device ID.
                  </p>
                  <p>
                    The system will return the associated (hashed) DID so you can verify
                    the current owner's identity.
                  </p>
                  <p>
                    This is useful for checking if a device is properly registered before
                    purchasing or accepting it.
                  </p>
                </div>
              }
            />

            <FeatureCard
              icon={<FileCheck className="h-6 w-6 text-white" />}
              title="Registration"
              description="Register a new device to establish ownership with blockchain security."
              action="Register Device"
              color="bg-emerald-500"
              onClick={handleOpenRegistration}
              imageSrc="/public/uploads/reg-Photoroom.jpg"
              infoContent={
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Device registration creates a permanent ownership record on the blockchain,
                    linking your DID with the device's unique ID.
                  </p>
                  <p>
                    You'll need to provide your personal information and device details to
                    complete the registration process.
                  </p>
                  <p>
                    Once registered, a device cannot be re-registered by anyone else,
                    providing strong ownership protection.
                  </p>
                </div>
              }
            />
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg animate-float"
          onClick={handleOpenMessages}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
          
        <Sheet open={showMessages} onOpenChange={setShowMessages}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <div className="h-full flex flex-col">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">Recent Messages</h3>
                <p className="text-sm text-muted-foreground">Your recent device notifications and system messages</p>
              </div>
              
              <div className="py-4 flex-1 overflow-auto">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">Device Registration Complete</p>
                          <span className="text-xs text-muted-foreground">2d ago</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Your iPhone 13 Pro has been successfully registered with your DID.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4 mt-auto">
                <Button variant="outline" className="w-full" onClick={() => setShowMessages(false)}>
                  Close Messages
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>
      <Footer />

      <Dialog open={activeDialog === "verification"} onOpenChange={() => activeDialog === "verification" && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Verify Device Ownership</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Verify Device Ownership</h2>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="did">DID (Decentralized Identifier)</Label>
                <Input
                  id="did"
                  placeholder="Enter your DID or connect with Metamask"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="Enter the device ID to verify"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Verify Ownership
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "checking"} onOpenChange={() => activeDialog === "checking" && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Check Device Registration</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-5 w-5 text-purple-500" />
              <h2 className="text-xl font-semibold">Check Device Registration</h2>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="check-deviceId">Device ID</Label>
                <Input
                  id="check-deviceId"
                  placeholder="Enter the device ID to check"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Check Registration
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "registration"} onOpenChange={() => activeDialog === "registration" && handleCloseDialog()}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Register New Device</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-6">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="text-xl font-semibold">Register New Device</h2>
            </div>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" placeholder="Enter your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone Number</Label>
                <Input
                  id="reg-phone"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-did">DID (Decentralized Identifier)</Label>
                <Input
                  id="reg-did"
                  placeholder="Enter your DID or connect with Metamask"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-deviceId">Device ID</Label>
                <Input
                  id="reg-deviceId"
                  placeholder="Enter the device ID to register"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  Register Device
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
