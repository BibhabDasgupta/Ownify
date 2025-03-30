
import LandingHero from "@/components/LandingHero";
import FeatureSection from "@/components/FeatureSection";
import WorkflowViewer from "@/components/WorkflowViewer";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }} // Adjust margin as needed
          transition={{ duration: 0.6 }}
        >
          <LandingHero />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeatureSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <WorkflowViewer />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
