import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Info, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  color: string;
  onClick: () => void;
  infoContent?: ReactNode;
  imageSrc?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  action,
  color,
  onClick,
  infoContent,
  imageSrc
}: FeatureCardProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  
  const cardStyle = imageSrc ? {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};
  
  return (
    <Card className="h-full min-h-[500px] relative overflow-hidden" style={cardStyle}>
      {/* Background overlay with blur */}
      {imageSrc && (
        <div className="absolute inset-0 backdrop-blur-md opacity-95" />
      )}
      
      <CardHeader className="relative z-10 mt-7">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mt-11 ${color}`}>
          {icon}
        </div>
        
        <CardTitle className={cn("text-xl font-medium flex items-center", imageSrc && "text-white")}>
          {title}
          {infoContent && (
            <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogTitle className="sr-only">{title} Information</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4"
                  onClick={() => setIsInfoOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  {infoContent}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        <CardDescription className={cn(imageSrc && "text-white/90")}>
          {description}
        </CardDescription>
        
        <div className="space-y-2">
          <Button
            onClick={onClick}
            className="w-full gap-2 justify-center"
          >
            {action} <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Dialog open={isInstructionsOpen} onOpenChange={setIsInstructionsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("w-full mt-2 flex items-center justify-center gap-1 text-xs", 
                  imageSrc && "text-white/90 hover:text-white hover:bg-white/10")}
              >
                <FileText className="h-3 w-3" />
                Instructions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle className="sr-only">How to {title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setIsInstructionsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="pt-6">
                <h3 className="text-lg font-semibold mb-2">How to {title}</h3>
                <div className="space-y-3 text-muted-foreground">
                  {title === "Verification" && (
                    <>
                      <p>To verify device ownership:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Enter your DID (Decentralized Identifier) or connect with Metamask</li>
                        <li>Enter the device ID you want to verify</li>
                        <li>Click "Verify Ownership" to check if you're the registered owner</li>
                        <li>The system will validate the cryptographic proof on the blockchain</li>
                        <li>Results will show the verification status and ownership details</li>
                      </ol>
                    </>
                  )}
                  {title === "Checking" && (
                    <>
                      <p>To check device registration:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Enter the device ID you want to check</li>
                        <li>Click "Check Registration" to search the blockchain registry</li>
                        <li>The system will return the registration status</li>
                        <li>If registered, you'll see the owner's DID (hashed for privacy)</li>
                        <li>Use this information to verify legitimacy before purchase</li>
                      </ol>
                    </>
                  )}
                  {title === "Registration" && (
                    <>
                      <p>To register a new device:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Log in to your account (required for registration)</li>
                        <li>Enter your personal details and contact information</li>
                        <li>Enter your DID or connect with Metamask</li>
                        <li>Enter the device ID you want to register</li>
                        <li>Click "Register Device" to create the blockchain record</li>
                        <li>Once registered, you'll receive a confirmation message</li>
                      </ol>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
