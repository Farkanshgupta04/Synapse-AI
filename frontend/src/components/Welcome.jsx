import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import FeatureCard from "./FeatureCard";
import HowItWorks from "./HowItWorks";
import DemoModal from "./DemoModal";
import { useAuth } from "../context/AuthProvider";
import aiOrbImage from "../assets/welcome-ai-orb.svg";
import promptFlowImage from "../assets/welcome-prompt-flow.svg";
import secureChatImage from "../assets/welcome-secure-chat.svg";

function Welcome() {
  const navigate = useNavigate();
  const [authUser] = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      title: "AI-assisted conversations",
      desc: "Create and iterate on prompts with contextual chat history.",
    },
    { title: "Sessions", desc: "Save, recall and manage chat sessions." },
    { title: "Fast & private", desc: "Local-first UX and protected user data." },
  ];

  const showcaseImages = [
    {
      src: aiOrbImage,
      alt: "AI orb illustration",
      title: "Adaptive AI",
      desc: "Elegant intelligence visuals for the landing page.",
    },
    {
      src: promptFlowImage,
      alt: "Prompt flow illustration",
      title: "Prompt Flow",
      desc: "A clean visual that suggests fast iteration and structure.",
    },
    {
      src: secureChatImage,
      alt: "Secure chat illustration",
      title: "Private by Design",
      desc: "A visual that reinforces trust and secure conversations.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1e1e1e] via-[#232327] to-[#1a1a1e] text-white hide-scrollbar">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: 200% center;
          }
          50% {
            background-position: -200% center;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .feature-card-animation {
          animation: fadeInUp 0.6s ease-out;
        }

        .feature-card-animation:nth-child(2) {
          animation-delay: 0.1s;
        }

        .feature-card-animation:nth-child(3) {
          animation-delay: 0.2s;
        }

        .step-animation {
          animation: fadeInUp 0.6s ease-out;
        }

        .step-animation:nth-child(1) {
          animation-delay: 0.2s;
        }

        .step-animation:nth-child(2) {
          animation-delay: 0.3s;
        }

        .step-animation:nth-child(3) {
          animation-delay: 0.4s;
        }

        .hero-title {
          animation: fadeInDown 0.8s ease-out;
        }

        .hero-subtitle {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .hero-buttons {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .glow-border {
          border: 1px solid rgba(99, 102, 241, 0.2);
          transition: all 0.3s ease;
        }

        .glow-border:hover {
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }
      `}</style>

      <Hero
        onGetStarted={() => navigate(authUser ? "/dashboard" : "/login")}
        onExplore={() => navigate("/signup", { replace: false })}
        isLoaded={isLoaded}
      />

      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcaseImages.map((item, idx) => (
            <div
              key={item.title}
              className={`feature-card-animation ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="overflow-hidden rounded-2xl glow-border bg-[#1f1f24] p-3 transition-all duration-300 hover:scale-[1.02]">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-56 w-full rounded-xl object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to accelerate your AI workflows
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={`feature-card-animation ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <FeatureCardDark title={f.title} desc={f.desc} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-700 bg-gradient-to-b from-transparent to-indigo-950/10 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400">
              Get started in three simple steps
            </p>
          </div>
          <div className="space-y-8">
            <HowItWorksDark />
          </div>
        </div>
      </section>

      <DemoModal />
    </main>
  );
}

// Dark theme Feature Card component
function FeatureCardDark({ title, desc }) {
  return (
    <div className="p-6 bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-lg glow-border transition-all duration-300 hover:scale-105">
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 flex items-center justify-center">
        <span className="text-white text-lg">✨</span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

// Dark theme How It Works component
function StepDark({ num, title, desc, index }) {
  return (
    <div
      className={`step-animation flex items-start gap-4 p-6 rounded-lg glow-border hover:scale-105 transition-all duration-300`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function HowItWorksDark() {
  const steps = [
    { num: 1, title: "Start a session", desc: "Create a new chat or pick a template." },
    { num: 2, title: "Iterate quickly", desc: "Refine prompts, save versions." },
    { num: 3, title: "Export results", desc: "Copy, save or share outputs safely." },
  ];

  return (
    <>
      {steps.map((step, idx) => (
        <StepDark key={step.num} num={step.num} title={step.title} desc={step.desc} index={idx} />
      ))}
    </>
  );
}

export default Welcome;
