
import { CheckCircle, Fingerprint, Shield, RefreshCw } from "lucide-react";

const features = [
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Secure Verification",
    description:
      "Verify device ownership instantly with blockchain-backed security and digital signatures."
  },
  {
    icon: <Fingerprint className="h-6 w-6 text-primary" />,
    title: "Unique Device Identity",
    description:
      "Each device gets a unique digital identity that can't be tampered with or duplicated."
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Proof of Ownership",
    description:
      "Establish and transfer ownership with cryptographic proof that's publicly verifiable."
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-primary" />,
    title: "Easy Registration",
    description:
      "Register your devices in minutes with our intuitive process and secure blockchain storage."
  }
];

export default function FeatureSection() {
  return (
    <section className="py-20 bg-accent/50 dark:bg-accent/10">
      <div className="page-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Ownify Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform combines user-friendly interfaces with powerful blockchain technology
            to provide a seamless device ownership management experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-6 rounded-xl transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
