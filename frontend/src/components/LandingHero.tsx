import { ArrowRight, FileText, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { X } from "lucide-react";

export default function LandingHero() {
  const navigate = useNavigate();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  
  const handleGetStarted = () => {
    // Force navigation to dashboard without any checks
    navigate("/dashboard", { replace: true });
  };

  const handleWatchDemo = () => {
    // Scroll to the video section in the WorkflowViewer component
    const videoSection = document.querySelector('.WorkflowViewer');
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleInstructions = () => {
    setIsInstructionsOpen(true);
  };
  
  return (
    <section className="pt-32 pb-20 md:pb-32 flex flex-col items-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -right-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="page-container relative z-10 text-center">
        <div className="inline-block animate-fade-in-up">
          <div className="bg-accent px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-6">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-medium">Secure device ownership verification</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up">
          Welcome to <span className="text-primary">ownify</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up">
          The next generation platform for verifying, registering, and managing device ownership 
          with blockchain-secured proof that's immutable and transparent.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
          <Button 
            size="lg" 
            className="gap-2 px-8 rounded-full font-medium"
            onClick={handleGetStarted}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 rounded-full"
              onClick={handleInstructions}
            >
              <FileText className="h-4 w-4" />
              Instructions
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              className="gap-2 rounded-full"
              onClick={handleWatchDemo}
            >
              <PlayCircle className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Ownify Instructions</DialogTitle>
           <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={() => setIsInstructionsOpen(false)}
          >
            <X className="h-4 w-4" />
           </Button>  
          
          <div className="bg-black rounded-md p-8 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Ownify Instructions</h2>
            <div className="prose prose-sm max-w-none">
              <h3>Getting Started</h3>
              <p>
                Ownify helps you secure, verify, and manage ownership of your devices with blockchain technology.
                Follow these simple steps to get started:
              </p>
              
              <h3>Device Registration</h3>
              <p>
                When registering a new device, you'll need to provide both your unique DID 
                (from your Metamask wallet) and the device's unique ID. The system will create 
                a cryptographic signature linking these identifiers.
              </p>
              
              <h3>Verification Process</h3>
              <p>
                To verify device ownership, the system checks the blockchain for the existence 
                of a record containing the hashed DID and Device ID, along with the cryptographic 
                signature that proves ownership.
              </p>
              
              <h3>Device Checking</h3>
              <p>
                Anyone can check a device's registration status by entering its Device ID. The 
                system will return the associated (hashed) DID so the current owner can be verified.
              </p>
              
              <h3>Security Measures</h3>
              <p>
                All data stored on the blockchain is securely hashed, and signature validity is 
                verified using cryptographic methods. Once a device is registered, re-registration 
                attempts are automatically detected, denied and the legitimate holder is informed.
              </p>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  For more detailed information, please refer to our complete documentation or 
                  contact our support team.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
