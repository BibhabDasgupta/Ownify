import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, PlayCircle, X } from "lucide-react";

export default function WorkflowViewer() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<"video" | "pdf">("video");
  const videoSectionRef = useRef<HTMLDivElement>(null);
  
  const handleOpenPdf = () => {
    setDialogContent("pdf");
    setIsDialogOpen(true);
  };
  
  const handleOpenVideo = () => {
    // Scroll to video section
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="py-16 md:py-24 WorkflowViewer">
      {/* ... keep existing code (section title, description, and buttons) */}
      <div className="page-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Understand the Workflow</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how device registration, verification, and ownership proof work together
            in our streamlined system.
          </p>
          
          {/* <div className="flex gap-4 justify-center mt-8">
            <Button 
              onClick={handleOpenVideo}
              variant="outline" 
              size="lg" 
              className="gap-2"
            >
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </Button>
            <Button 
              onClick={handleOpenPdf}
              variant="outline" 
              size="lg" 
              className="gap-2"
            >
              <FileText className="h-5 w-5" />
              View Instructions
            </Button>
          </div> */}
        </div>
        
        {/* Video Section */}
        <div ref={videoSectionRef} className="bg-card rounded-xl overflow-hidden shadow-md mb-10">
          <div className="relative aspect-video">
            <div className="aspect-video bg-black/90 rounded-md flex items-center justify-center text-muted">
              <div className="text-center p-8">
                <PlayCircle className="h-12 w-12 mx-auto mb-4 text-primary/70" />
                <h3 className="text-lg font-medium mb-2">Demo Video</h3>
                <p className="text-sm text-muted-foreground">
                  This is where the workflow demonstration video would appear.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ... keep existing code (dialog content) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">Workflow Information</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={() => setIsDialogOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {dialogContent === "video" ? (
            <div className="aspect-video bg-black/90 rounded-md flex items-center justify-center text-muted">
              <div className="text-center p-8">
                <PlayCircle className="h-12 w-12 mx-auto mb-4 text-primary/70" />
                <h3 className="text-lg font-medium mb-2">Video Demo</h3>
                <p className="text-sm text-muted-foreground">
                  The workflow demonstration video would appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-md p-8 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Ownify Workflow Instructions</h2>
              <div className="prose prose-sm max-w-none">
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
                  attempts are automatically detected and denied.
                </p>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    For more detailed information, please refer to our complete documentation or 
                    contact our support team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
