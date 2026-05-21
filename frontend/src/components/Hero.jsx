import React from "react";
import { Link } from "react-router-dom";

function Hero({ onGetStarted, onExplore, isLoaded }) {
  return (
    <header className="py-20 bg-gradient-to-b from-[#1e1e1e] to-[#232327] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "1s" }}></div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <style>{`
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

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          .hero-title {
            animation: fadeInDown 0.8s ease-out;
            background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .hero-subtitle {
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }

          .hero-buttons {
            animation: fadeInUp 0.8s ease-out 0.4s both;
          }

          .btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          }

          .btn-primary:hover {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
            transform: translateY(-2px);
          }

          .btn-secondary {
            border: 1px solid rgba(99, 102, 241, 0.4);
            background: rgba(99, 102, 241, 0.05);
            transition: all 0.3s ease;
          }

          .btn-secondary:hover {
            background: rgba(99, 102, 241, 0.15);
            border-color: rgba(99, 102, 241, 0.8);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
            transform: translateY(-2px);
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>

        <h1 className="hero-title text-5xl md:text-6xl font-extrabold mb-4">
          Synapse AI
        </h1>
        <p className="hero-subtitle text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Fast, private AI chat sessions and prompt tooling to accelerate your
          workflows.
        </p>

        <div className="hero-buttons flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="btn-primary text-white px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Get Started
          </button>

          <button
            onClick={onExplore}
            className="btn-secondary text-indigo-300 px-8 py-3 rounded-lg font-semibold text-lg hover:text-white"
          >
            Explore as guest
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-400 space-x-4">
          <Link to="/login" className="hover:text-indigo-400 transition-colors">
            Login
          </Link>
          <span>•</span>
          <Link to="/signup" className="hover:text-indigo-400 transition-colors">
            Signup
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Hero;
