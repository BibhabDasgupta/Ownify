
import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        message: ""
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
              A modern device ownership management and verification system built for the future.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors" replace>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Register Device
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Verify Ownership
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground transition-colors">
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
                  We'll get back to you soon. For immediate assistance, you can email us at:
                </p>
                <a 
                  href="mailto:bibhab9012004@gmail.com" 
                  className="text-blue-500 hover:underline"
                >
                  bibhab9012004@gmail.com
                </a>
                <div className="pt-4">
                  <Button onClick={() => {
                    setIsContactOpen(false);
                    setSubmitSuccess(false);
                  }}>
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
      </div>
    </footer>
  );
}
