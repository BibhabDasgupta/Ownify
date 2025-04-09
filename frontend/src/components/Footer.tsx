import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import * as ethers from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { X } from "lucide-react";

interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

const contractAddress = "0x885d93142535329562ef65bB77C2BBf11Dd32419";
const contractABI = [
  {
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "hashedDID",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "registeredBy",
        type: "address",
      },
    ],
    name: "DeviceRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "registeredBy",
        type: "address",
      },
    ],
    name: "DeviceRevocationRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "registeredBy",
        type: "address",
      },
    ],
    name: "DeviceRevoked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "registrations",
    outputs: [
      {
        internalType: "bytes32",
        name: "hashedDID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "userSignature",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "systemSignature",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "registeredBy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isRevoked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "hashedDID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "userSignature",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "systemSignature",
        type: "bytes",
      },
    ],
    name: "registerDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
    ],
    name: "revokeDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
    ],
    name: "removeRevocation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hashedDeviceId",
        type: "bytes32",
      },
    ],
    name: "getRegistration",
    outputs: [
      {
        internalType: "bytes32",
        name: "hashedDID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "userSignature",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "systemSignature",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "registeredBy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isRevoked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [revokeData, setRevokeData] = useState({ did: "", deviceId: "" });
  const [devices, setDevices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isLoggedIn = () => !!localStorage.getItem("user-token");
  const getUserDid = () => localStorage.getItem("user-did") || "";

  useEffect(() => {
    if (isLoggedIn() && isRevokeOpen) {
      fetchDevices();
      setRevokeData((prev) => ({ ...prev, did: getUserDid() }));
    }
  }, [isRevokeOpen]);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("user-token");
      const userDid = getUserDid();
      const response = await fetch(
        `http://localhost:5000/api/device/devices?did=${userDid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch devices");
      setDevices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeAction = async (action) => {
    const startTime = performance.now();
    try {
      const provider =
        (await detectEthereumProvider()) as MetaMaskProvider | null;
      if (!provider) throw new Error("MetaMask not detected");

      await provider.request({ method: "eth_requestAccounts" });
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const hashedDeviceId = ethers.keccak256(
        ethers.toUtf8Bytes(revokeData.deviceId)
      );
      const [hashedDID, , , , , isRevoked] = await contract.getRegistration(
        hashedDeviceId
      );

      if (hashedDID === ethers.ZeroHash) {
        toast({
          title: "Error",
          description: "Device not registered on the blockchain.",
          variant: "destructive",
        });
        return;
      }

      if (action === "revoke") {
        if (isRevoked) {
          toast({
            title: "Device Already Revoked",
            description: "This device has already been revoked.",
            variant: "destructive",
          });
          return;
        }
        const tx = await contract.revokeDevice(hashedDeviceId);
        await tx.wait();
        toast({ title: "Success", description: "Device revoked successfully" });
      } else {
        if (!isRevoked) {
          toast({
            title: "No Revocation Found",
            description:
              "This device is not revoked, so revocation cannot be removed.",
            variant: "destructive",
          });
          return;
        }
        const tx = await contract.removeRevocation(hashedDeviceId);
        const receipt = await tx.wait(); // Wait for transaction confirmation

        if (!receipt) throw new Error("Transaction receipt is undefined");

        const endTime = performance.now(); // End timing
        const executionTime = (endTime - startTime) / 1000;
        const gasUsed = receipt.gasUsed.toString();
        const gasCostWei = ethers.formatEther(
          BigInt(receipt.gasUsed.toString()) *
            BigInt(receipt.gasPrice.toString())
        );
        console.log(
          `${
            action === "revoke" ? "Revocation" : "Revocation Removal"
          } Time: ${executionTime.toFixed(2)} seconds`
        );
        console.log(
          `${
            action === "revoke" ? "Revocation" : "Revocation Removal"
          } Gas Used: ${gasUsed} units`
        );
        console.log(
          `${
            action === "revoke" ? "Revocation" : "Revocation Removal"
          } Gas Cost: ${gasCostWei} ETH`
        );
      }
      setIsRevokeOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/user/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Submission failed");

      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        reason: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="py-8 border-t border-border">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="absolute w-3.5 h-3.5 rounded-full bg-primary/30"></div>
                <div className="absolute w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <span className="font-bold text-lg">ownify</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              A modern device ownership management and verification system built
              for the future.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-foreground transition-colors"
                  replace
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!isLoggedIn()) {
                      toast({
                        title: "Login Required",
                        description: "Please login to revoke a device",
                        variant: "destructive",
                      });
                      navigate("/login");
                    } else {
                      setIsRevokeOpen(true);
                    }
                  }}
                  className="hover:text-foreground transition-colors text-left w-full"
                >
                  Revoke Device
                </button>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Verify Ownership
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="hover:text-foreground transition-colors text-left w-full"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {currentYear} Ownify. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link to="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </Link>
            <Link to="#" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
          </div>
        </div>
        <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Contact Us</DialogTitle>
            </DialogHeader>

            {submitSuccess ? (
              <div className="space-y-4 text-center py-8">
                <div className="text-green-500 font-medium">
                  Thank you for contacting us!
                </div>
                <p>
                  We'll get back to you soon. For immediate assistance, you can
                  email us at:
                </p>
                <a
                  href="mailto:bibhab9012004@gmail.com"
                  className="text-blue-500 hover:underline"
                >
                  bibhab9012004@gmail.com
                </a>
                <div className="pt-4">
                  <Button
                    onClick={() => {
                      setIsContactOpen(false);
                      setSubmitSuccess(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Contact *</Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="e.g. Support, Feedback, Partnership"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    For immediate support, email:{" "}
                    <a
                      href="mailto:bibhab9012004@gmail.com"
                      className="text-blue-500 hover:underline"
                    >
                      bibhab9012004@gmail.com
                    </a>
                  </p>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Device Revocation</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setIsRevokeOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <Tabs defaultValue="revoke" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="revoke">Revoke Device</TabsTrigger>
                <TabsTrigger value="remove">Remove Revocation</TabsTrigger>
              </TabsList>
              <TabsContent value="revoke">
                <form
                  className="space-y-4 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRevokeAction("revoke");
                  }}
                >
                  <div className="space-y-2">
                    <Label>Your DID</Label>
                    <Input value={revokeData.did} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <select
                      className="w-full p-2 border rounded bg-white text-black"
                      value={revokeData.deviceId}
                      onChange={(e) =>
                        setRevokeData((prev) => ({
                          ...prev,
                          deviceId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Select a device
                      </option>
                      {devices.length > 0 ? (
                        devices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.deviceName} ({device.deviceId})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No devices available
                        </option>
                      )}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Revoke Device
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="remove">
                <form
                  className="space-y-4 mt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRevokeAction("remove");
                  }}
                >
                  <div className="space-y-2">
                    <Label>Your DID</Label>
                    <Input value={revokeData.did} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Device ID</Label>
                    <select
                      className="w-full p-2 border rounded bg-white text-black"
                      value={revokeData.deviceId}
                      onChange={(e) =>
                        setRevokeData((prev) => ({
                          ...prev,
                          deviceId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Select a device
                      </option>
                      {devices.length > 0 ? (
                        devices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.deviceName} ({device.deviceId})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No devices available
                        </option>
                      )}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Remove Revocation
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}
