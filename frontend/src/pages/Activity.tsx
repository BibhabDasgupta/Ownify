import { useState, useEffect } from "react";
import { Activity as ActivityIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Activity() {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLoggedIn = () => !!localStorage.getItem("user-token");
  const getUserDid = () => localStorage.getItem("user-did") || "";

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in to view your activity log.",
        variant: "destructive",
        duration: 5000,
      });
      navigate("/dashboard"); // Redirect to login page
      return;
    }

    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("user-token");
        const userDid = getUserDid();
        const response = await fetch(`http://localhost:5000/api/device/devices?did=${userDid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch devices");
        setDevices(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (getUserDid()) fetchDevices();
  }, [navigate, toast]); // Add dependencies for useEffect

  const handleDownload = async (deviceId) => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in to download the PDF.",
        variant: "destructive",
        duration: 5000,
      });
      navigate("/dashboard");
      return;
    }
  
    const token = localStorage.getItem("user-token");
    const userDid = getUserDid();
    if (!token || !userDid) {
      toast({
        title: "Error",
        description: "Missing token or user DID. Please log in again.",
        variant: "destructive",
      });
      return;
    }
  
    console.log("Downloading PDF for deviceId:", deviceId); // Debug
    console.log("User DID from localStorage:", userDid); // Debug
    console.log("Token:", token); // Debug
    try {
      const response = await fetch(`http://localhost:5000/api/device/download/${deviceId}?userDid=${userDid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Send token in header
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to download PDF");
      }
  
      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${deviceId}_registration.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      toast({
        title: "Success",
        description: "PDF downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        <div className="page-container">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-2">
            <ActivityIcon className="h-6 w-6" />
            Activity Log
          </h1>
          <div className="space-y-4">
            {devices.length === 0 ? (
              <p className="text-muted-foreground">No devices registered yet.</p>
            ) : (
              devices.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex justify-between items-center p-4 bg-accent rounded-lg"
                >
                  <div>
                    <p className="font-medium">{device.deviceName}</p>
                    <p className="text-sm text-muted-foreground">ID: {device.deviceId}</p>
                    <p className="text-sm text-muted-foreground">
                      Registered: {new Date(device.registeredAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleDownload(device.deviceId)}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}