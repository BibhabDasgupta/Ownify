import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Search,
  FileCheck,
  AlertTriangle,
  X,
  MessageCircle,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Resizable } from "re-resizable";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import FeatureCard from "@/components/FeatureCard";
import { CalendarDays, Cpu, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
// import { ethers } from "ethers";
import * as ethers from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

// Define MetaMask provider type (EIP-1193 compatible)
interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

const contractAddress = "0x88346Ba7902f2C287304Ec86dfFA6909563Bf56B";
const contractABI = [
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
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
];

const SYSTEM_PUBLIC_KEY = "0x5B0158FdB128C517E6d8d8BE20b3A0dA8ddAc505";

export default function Dashboard() {
  const [activeDialog, setActiveDialog] = useState<
    | "verification"
    | "checking"
    | "registration"
    | "result"
    | "verifyResult"
    | null
  >(null);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [deviceId, setDeviceId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [checkDeviceId, setCheckDeviceId] = useState("");
  const [verifyDeviceId, setVerifyDeviceId] = useState("");
  const [verifyUserDid, setVerifyUserDid] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [checkResult, setCheckResult] = useState<{
    isRegistered: boolean;
    user?: { name: string; email: string; did: string };
    registeredBy?: string;
    timestamp?: string;
  } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const resizableHandleStyle = {
    width: "4px",
    height: "100%",
    right: "0", // Position handle on the right but resize to left
    top: "0",
    cursor: "col-resize",
    backgroundColor: "transparent",
  };

  const isLoggedIn = () => !!localStorage.getItem("user-token");
  const isProfileCompleted = () =>
    localStorage.getItem("profile-completed") === "true";
  const getUserDid = () => localStorage.getItem("user-did") || "";

  useEffect(() => {
    if (isLoggedIn() && !isProfileCompleted()) {
      navigate("/profile");
    } else if (isLoggedIn()) {
      fetchMessages(); // Add this line
    }
  }, [navigate]);

  const handleOpenVerification = () => setActiveDialog("verification");
  const handleOpenChecking = () => setActiveDialog("checking");

  const fetchMessages = async () => {
    const userDid = getUserDid();
    try {
      const token = localStorage.getItem("user-token");
      const response = await fetch(
        "http://localhost:5000/api/device/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userDid,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch messages");

      setMessages(data.messages); // Assuming backend returns { messages: [...] }
      const unread = data.messages.filter((msg: any) => !msg.read).length;
      setUnreadCount(unread);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("user-token");
      const response = await fetch(
        "http://localhost:5000/api/device/mark-as-read",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messageId, userDid: getUserDid() }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark message as read");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const extractAddressFromDid = (did: string) => {
    if (did.startsWith("did:ethr:")) {
      return did.replace("did:ethr:", "").toLowerCase();
    }
    if (ethers.isAddress(did)) {
      return did.toLowerCase();
    }
    return null;
  };

  const handleOpenRegistration = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in for registration",
        variant: "destructive",
        duration: 5000,
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
        duration: 5000,
      });
      return;
    }
    setShowMessages(true);
    fetchMessages();
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setDeviceName("");
    setDeviceId("");
    setPrivateKey("");
    setCheckDeviceId("");
    setCheckResult(null);
  };

  const handleActivityClick = () => {
    if (!isLoggedIn()) {
      toast({
        title: "Login Required",
        description: "Please log in to view your activity log",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    navigate("/activity");
  };

  const handleMessageClick = (message: any) => {
    markAsRead(message._id);
    setSelectedMessage(message);
  };

  const parseMessageContent = (content: string) => {
    const isReRegistration = content.includes("re-register");
    const title = isReRegistration
      ? "Re-Registration Attempt"
      : "Device Registration Complete";


    console.log(content);
    const deviceIdMatch = content.match(/ID: (\d+)/);
    const deviceId = deviceIdMatch ? deviceIdMatch[1] : null;

    const detailsMatch = content.match(/Details of the registrant: (.*)/s);
    let details: { label: string; value: string }[] = [];

    if (detailsMatch) {
      details = detailsMatch[1]
        .split("-")
        .filter((item) => item.trim())
        .map((item) => {
          const [label, ...valueParts] = item.split(":");
          return {
            label: label.trim(),
            value: valueParts.join(":").trim(),
          };
        });
    }

    return {
      title,
      deviceId,
      details,
      isReRegistration,
      rawContent: content,
    };
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("user-token");
      console.log("Token being sent:", token);

      const provider =
        (await detectEthereumProvider()) as MetaMaskProvider | null;
      if (!provider) throw new Error("MetaMask not detected");

      await provider.request({ method: "eth_requestAccounts" });
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner(); // Await signer in v6
      const metaMaskAddress = await signer.getAddress(); // Await getAddress
      const metaMaskDid = `did:ethr:${metaMaskAddress}`;

      const userDid = getUserDid();
      const didAddress = extractAddressFromDid(userDid);
      const metaMaskDidAddress = extractAddressFromDid(metaMaskDid);
      console.log(privateKey);

      const userWallet = new ethers.Wallet(privateKey);
      const privateKeyAddress = userWallet.address;
      console.log(privateKeyAddress);

      if (!didAddress || didAddress !== metaMaskDidAddress) {
        throw new Error(
          "The DID does not match your MetaMask address. Please use the correct MetaMask account."
        );
      }

      console.log("ethers:", ethers); // Debug ethers availability
      if (!ethers.keccak256) throw new Error("ethers.keccak256 is undefined");

      const hashedDeviceId = ethers.keccak256(ethers.toUtf8Bytes(deviceId));
      const hashedDID = ethers.keccak256(ethers.toUtf8Bytes(userDid));

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const [existingHashedDID, , , registeredBy, timestamp] =
        await contract.getRegistration(hashedDeviceId);

      if (existingHashedDID !== ethers.ZeroHash) {
        if (registeredBy.toLowerCase() === metaMaskAddress.toLowerCase()) {
          toast({
            title: "Device Already Registered",
            description: "You have already registered this device previously.",
            variant: "default",
          });
          return;
        }
        // Device is pre-registered; send registeredBy address to backend
        const originalUserDid = `${registeredBy}`; // Assuming DID format matches

        const response = await fetch(
          "http://localhost:5000/api/device/check-and-notify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              deviceId,
              originalUserDid,
              newUserDid: userDid,
            }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(text || "Server returned non-JSON response");
        }

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to process pre-registration");

        toast({
          title: "Registration Failed",
          description: `This device is already registered by DID: ${originalUserDid}. The original owner has been notified.`,
          variant: "destructive",
        });
        return;
      }

      //   console.log("Registration - deviceId:", deviceId);
      // console.log("Registration - hashedDeviceId:", hashedDeviceId);
      // console.log("Registration - userDid:", userDid);
      // console.log("Registration - hashedDID:", hashedDID);

      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["bytes32", "bytes32"],
          [hashedDeviceId, hashedDID]
        )
      );

      const userSignature = await signer.signMessage(
        ethers.getBytes(messageHash)
      );
      //onst systemSignature = await systemWallet.signMessage(ethers.getBytes(messageHash));

      const registerResponse = await fetch(
        "http://localhost:5000/api/device/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deviceName,
            deviceId,
            userSignature,
            userDid,
          }),
        }
      );

      const data = await registerResponse.json();
      console.log("Backend response:", data);
      console.log("Response status:", registerResponse.status);
      if (!registerResponse.ok)
        throw new Error(data.error || "Registration failed");

      //const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.registerDevice(
        data.hashedDeviceId,
        data.hashedDID,
        data.userSignature,
        data.systemSignature,
        { gasLimit: 300000 }
      );
      await tx.wait();

      toast({
        title: "Success",
        description: "Device registered successfully!",
        variant: "default",
      });
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCheckDevice = async (e: React.FormEvent) => {
    e.preventDefault();
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
        ethers.toUtf8Bytes(checkDeviceId)
      );
      const [
        hashedDID,
        userSignature,
        systemSignature,
        registeredBy,
        timestamp,
      ] = await contract.getRegistration(hashedDeviceId);

      if (hashedDID === ethers.ZeroHash) {
        setCheckResult({
          isRegistered: false,
        });
        setActiveDialog("result");
        return;
      }

      // Verify system signature
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["bytes32", "bytes32"],
          [hashedDeviceId, hashedDID]
        )
      );
      const recoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        systemSignature
      );

      if (recoveredAddress.toLowerCase() !== SYSTEM_PUBLIC_KEY.toLowerCase()) {
        toast({
          title: "Invalid Signature",
          description: "The system signature verification failed.",
          variant: "destructive",
        });
        handleCloseDialog();
        return;
      }

      // Fetch user details from backend using registeredBy address
      //const token = localStorage.getItem("user-token");
      const response = await fetch(
        `http://localhost:5000/api/device/by-address?address=${registeredBy}`,
        {
          method: "GET",
        }
      );

      const userData = await response.json();
      if (!response.ok && response.status !== 404) {
        throw new Error(userData.error || "Failed to fetch user details");
      }

      if (response.status === 404) {
        setCheckResult({
          isRegistered: true,
          registeredBy,
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        });
      } else {
        setCheckResult({
          isRegistered: true,
          user: {
            name: userData.name,
            email: userData.email,
            did: userData.did,
          },
          registeredBy,
          timestamp: new Date(Number(timestamp) * 1000).toLocaleString(),
        });
      }

      setActiveDialog("result");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      handleCloseDialog();
    }
  };

  const handleVerifyDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const provider =
        (await detectEthereumProvider()) as MetaMaskProvider | null;
      if (!provider) throw new Error("MetaMask not detected");

      await provider.request({ method: "eth_requestAccounts" });
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const metaMaskAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const hashedDeviceId = ethers.keccak256(
        ethers.toUtf8Bytes(verifyDeviceId)
      );
      const providedHashedDID = ethers.keccak256(
        ethers.toUtf8Bytes(verifyUserDid.toLowerCase())
      );
      const [hashedDID, userSignature, systemSignature, registeredBy] =
        await contract.getRegistration(hashedDeviceId);

      // console.log("Verification - verifyDeviceId:", verifyDeviceId);
      // console.log("Verification - hashedDeviceId:", hashedDeviceId);
      // console.log("Verification - verifyUserDid:", verifyUserDid);
      // console.log("Verification - providedHashedDID:", providedHashedDID);
      // console.log("Verification - hashedDID (from blockchain):", hashedDID);

      console.log(registeredBy);
      // Check if device exists
      if (hashedDID === ethers.ZeroHash) {
        setVerifyResult({
          isValid: false,
          message: "Device ID does not exist on the blockchain.",
        });
        setActiveDialog("verifyResult");
        return;
      }

      // Verify system signature
      const messageHash = ethers.keccak256(
        ethers.solidityPacked(
          ["bytes32", "bytes32"],
          [hashedDeviceId, hashedDID]
        )
      );
      const systemRecoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        systemSignature
      );
      //console.log(systemRecoveredAddress);
      if (
        systemRecoveredAddress.toLowerCase() !== SYSTEM_PUBLIC_KEY.toLowerCase()
      ) {
        setVerifyResult({
          isValid: false,
          message:
            "System signature verification failed. Registration is not valid.",
        });
        setActiveDialog("verifyResult");
        console.log("Hello");
        return;
      }

      // Verify user signature with current MetaMask address
      const userRecoveredAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        userSignature
      );

      if (userRecoveredAddress.toLowerCase() !== verifyUserDid.toLowerCase()) {
        setVerifyResult({
          isValid: false,
          message: "User signature does not match your MetaMask address.",
        });
        setActiveDialog("verifyResult");
        console.log("Hello1");
        return;
      }
      //const userRecoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), userSignature);
      console.log(metaMaskAddress);
      console.log(userRecoveredAddress);
      // if (registeredBy.toLowerCase() !== metaMaskAddress.toLowerCase()) {
      //   setVerifyResult({
      //     isValid: false,
      //     message: "User signature does not match your MetaMask address.",
      //   });
      //   setActiveDialog("verifyResult");
      //   return;
      // }

      // Verify if hashedDID matches the provided userDid
      if (hashedDID !== providedHashedDID) {
        setVerifyResult({
          isValid: false,
          message: "Device ID is registered to a different DID.",
        });
        setActiveDialog("verifyResult");
        console.log("Hello2");
        return;
      }

      // All checks passed
      setVerifyResult({
        isValid: true,
        message:
          "Correct: Device ID is mapped to your DID and signatures are valid.",
      });
      setActiveDialog("verifyResult");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      handleCloseDialog();
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 relative">
        <div className="page-container">
          <div className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Device Management
              </h1>
              <p className="text-muted-foreground text-lg">
                Verify, check or register your devices securely with blockchain
                technology.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleActivityClick}
            >
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
                    Device verification allows you to confirm the ownership of a
                    device based on the provided DID (Decentralized Identifier)
                    and Device ID.
                  </p>
                  <p>
                    The system will check for a valid ownership record on the
                    blockchain and verify the cryptographic signature.
                  </p>
                  <p>
                    This process is essential for validating authentic ownership
                    during device transfers or second-hand purchases.
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
                    Device checking allows you to query a device's registration
                    status by entering its unique Device ID.
                  </p>
                  <p>
                    The system will return the associated (hashed) DID so you
                    can verify the current owner's identity.
                  </p>
                  <p>
                    This is useful for checking if a device is properly
                    registered before purchasing or accepting it.
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
                    Device registration creates a permanent ownership record on
                    the blockchain, linking your DID with the device's unique
                    ID.
                  </p>
                  <p>
                    You'll need to provide your personal information and device
                    details to complete the registration process.
                  </p>
                  <p>
                    Once registered, a device cannot be re-registered by anyone
                    else, providing strong ownership protection.
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
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        <Sheet open={showMessages} onOpenChange={setShowMessages}>
          <SheetContent
            className="p-0 overflow-hidden"
            side="right"
            style={{
              width: "auto",
              maxWidth: "100vw",
              right: 0,
              left: "auto",
            }}
          >
            <Resizable
              defaultSize={{ width: 400, height: "100%" }}
              minWidth={300}
              maxWidth={800}
              enable={{
                right: true,
              }}
              handleStyles={{
                right: resizableHandleStyle,
              }}
              className="h-full flex"
              onResize={(e, direction, ref) => {
                ref.style.left = "auto";
                ref.style.right = "0";
              }}
            >
              <div className="h-full flex flex-col w-full">
                <div className="border-b pb-4 px-6 pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Recent Messages</h3>
                      <p className="text-sm text-muted-foreground">
                        Your recent device notifications and system messages
                      </p>
                    </div>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMessages(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button> */}
                  </div>
                </div>

                <div className="py-4 flex-1 overflow-auto px-6">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => {
                        const parsed = parseMessageContent(message.content);
                        return (
                          <div
                            key={index}
                            className="flex gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                            onClick={() => handleMessageClick(message)}
                          >
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-sm">
                                  {parsed.title}
                                </p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {parsed.deviceId
                                  ? `Device ID: ${parsed.deviceId}`
                                  : parsed.rawContent}
                              </p>
                              {!message.read && (
                                <span className="text-xs text-blue-500 block mt-1">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No messages available.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t px-6 py-4 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowMessages(false)}
                  >
                    Close Messages
                  </Button>
                </div>
              </div>
            </Resizable>
          </SheetContent>
        </Sheet>
      </main>
      <Footer />

      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {selectedMessage && (
                <>
                  {parseMessageContent(selectedMessage.content)
                    .isReRegistration ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <FileCheck className="h-5 w-5 text-green-500" />
                  )}
                  {parseMessageContent(selectedMessage.content).title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMessage && (
              <>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {new Date(selectedMessage.timestamp).toLocaleString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>

                {(() => {
                  const parsed = parseMessageContent(selectedMessage.content);
                  return (
                    <div className="space-y-4">
                      {parsed.deviceId && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu className="h-5 w-5 text-blue-500" />
                            <h3 className="font-medium">Device Information</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Device ID
                              </p>
                              <p className="font-medium">{parsed.deviceId}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {parsed.details.length > 0 && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-5 w-5 text-purple-500" />
                            <h3 className="font-medium">Registrant Details</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {parsed.details.map((detail, i) => (
                              <div key={i}>
                                <p className="text-xs text-muted-foreground">
                                  {detail.label}
                                </p>
                                <p className="font-medium">
                                  {detail.value || "Not provided"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsed.details.length === 0 && (
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="whitespace-pre-line">
                            {parsed.rawContent}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMessage(null)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "verification"}
        onOpenChange={() =>
          activeDialog === "verification" && handleCloseDialog()
        }
      >
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
            <form className="space-y-4" onSubmit={handleVerifyDevice}>
              <div className="space-y-2">
                <Label htmlFor="verify-did">
                  DID (Decentralized Identifier)
                </Label>
                <Input
                  id="verify-did"
                  value={verifyUserDid}
                  onChange={(e) => setVerifyUserDid(e.target.value)}
                  placeholder="Enter your DID (e.g., did:ethr:0x...)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-deviceId">Device ID</Label>
                <Input
                  id="verify-deviceId"
                  value={verifyDeviceId}
                  onChange={(e) => setVerifyDeviceId(e.target.value)}
                  placeholder="Enter the device ID to verify"
                  required
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

      <Dialog
        open={activeDialog === "checking"}
        onOpenChange={() => activeDialog === "checking" && handleCloseDialog()}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">
            Check Device Registration
          </DialogTitle>
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
              <h2 className="text-xl font-semibold">
                Check Device Registration
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleCheckDevice}>
              <div className="space-y-2">
                <Label htmlFor="check-deviceId">Device ID</Label>
                <Input
                  id="check-deviceId"
                  value={checkDeviceId}
                  onChange={(e) => setCheckDeviceId(e.target.value)}
                  placeholder="Enter the device ID to check"
                  required
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

      <Dialog
        open={activeDialog === "registration"}
        onOpenChange={() =>
          activeDialog === "registration" && handleCloseDialog()
        }
      >
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

            <form className="space-y-4" onSubmit={handleRegisterDevice}>
              <div className="space-y-2">
                <Label htmlFor="reg-did">DID (Decentralized Identifier)</Label>
                <Input
                  id="reg-did"
                  value={getUserDid() || ""}
                  readOnly
                  placeholder="Enter your DID or connect with Metamask"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-deviceName">Device Name</Label>
                <Input
                  id="reg-deviceName"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Enter the device name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-deviceId">Device ID</Label>
                <Input
                  id="reg-deviceId"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter the device ID to register"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-privateKey">Private Key</Label>
                <Input
                  id="reg-privateKey"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your private key"
                  type="password"
                  required
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
      <Dialog
        open={activeDialog === "result"}
        onOpenChange={() => activeDialog === "result" && handleCloseDialog()}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Device Check Result</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pt-6 text-center">
            {checkResult && checkResult.isRegistered ? (
              <>
                <h2 className="text-xl font-semibold text-green-600">
                  User Already Registered
                </h2>
                <div className="mt-4 space-y-2">
                  {checkResult.user ? (
                    <>
                      <p>
                        <strong>Name:</strong> {checkResult.user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {checkResult.user.email}
                      </p>
                      <p>
                        <strong>DID:</strong> {checkResult.user.did}
                      </p>
                    </>
                  ) : (
                    <p>
                      No user details found in database for address:{" "}
                      {checkResult.registeredBy}
                    </p>
                  )}
                  <p>
                    <strong>Registered By:</strong> {checkResult.registeredBy}
                  </p>
                  <p>
                    <strong>Timestamp:</strong> {checkResult.timestamp}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-red-600">
                  No User Registered
                </h2>
                <p className="mt-4">
                  No user is registered for this device ID on the blockchain.
                </p>
              </>
            )}
            <div className="mt-6">
              <Button variant="outline" onClick={handleCloseDialog}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={activeDialog === "verifyResult"}
        onOpenChange={() =>
          activeDialog === "verifyResult" && handleCloseDialog()
        }
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Verification Result</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseDialog}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pt-6 text-center">
            {verifyResult && (
              <>
                <h2
                  className={`text-xl font-semibold ${
                    verifyResult.isValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {verifyResult.isValid ? "Correct" : "Wrong"}
                </h2>
                <p className="mt-4">{verifyResult.message}</p>
                <div className="mt-6">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
