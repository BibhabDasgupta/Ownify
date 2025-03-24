
import LandingHero from "@/components/LandingHero";
import FeatureSection from "@/components/FeatureSection";
import WorkflowViewer from "@/components/WorkflowViewer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in and profile is completed
    const isLoggedIn = !!localStorage.getItem("user-token");
    const profileCompleted = localStorage.getItem("profile-completed") === "true";
    
    // If logged in but profile not completed, redirect to profile
    if (isLoggedIn && !profileCompleted) {
      navigate("/profile");
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingHero />
        <FeatureSection />
        <WorkflowViewer />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
