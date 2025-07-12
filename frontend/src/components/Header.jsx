import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import LoginModal from "./modalbox/LoginModal"; // Import the LoginModal component
import RegistrationModal from "./modalbox/RegistrationModal"; // Import the RegistrationModal component
import DonationModal from "./modalbox/DonationModal";

const Header = () => {
  const { backendUrl, setToken, setUToken, utoken } = useContext(AppContext);
  const navigate = useNavigate();

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const [prefilledUsername, setPrefilledUsername] = useState("");

  const handleRegisterClick = () => {
    setShowRegistrationModal(true);
  };

  const handleDonationClick = () => {
    if (utoken) setShowDonationModal(true);
    else setShowLoginModal(true);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegistrationModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = (username) => {
    setPrefilledUsername(username);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setPrefilledUsername("");
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
  };

  const closeDonationModal = () => {
    setShowDonationModal(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Floating Interactive Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Hearts - Interactive */}
        <div className="absolute top-20 left-10 animate-bounce">
          <svg
            width="32"
            height="28"
            viewBox="0 0 24 24"
            className="text-red-400 fill-current animate-pulse hover:scale-110 transition-transform duration-300"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>

        <div
          className="absolute top-1/3 right-12 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <svg
            width="28"
            height="24"
            viewBox="0 0 24 24"
            className="text-red-300 fill-current animate-pulse hover:scale-110 transition-transform duration-300"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>

        <div
          className="absolute bottom-32 left-20 animate-bounce"
          style={{ animationDelay: "2s" }}
        >
          <svg
            width="24"
            height="20"
            viewBox="0 0 24 24"
            className="text-red-500 fill-current animate-pulse hover:scale-110 transition-transform duration-300"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>

        {/* Floating Red Brush Strokes - Animated */}
        <div className="absolute top-16 left-8 w-32 h-4 bg-red-400 rounded-full opacity-70 animate-pulse transform rotate-12 hover:opacity-90 transition-opacity duration-300"></div>
        <div className="absolute top-32 right-16 w-24 h-3 bg-red-500 rounded-full opacity-60 animate-bounce transform -rotate-6 hover:opacity-80 transition-opacity duration-300"></div>
        <div className="absolute bottom-24 left-16 w-20 h-3 bg-red-400 rounded-full opacity-80 animate-pulse transform rotate-45 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-2/3 right-32 w-28 h-3 bg-red-300 rounded-full opacity-50 animate-bounce transform rotate-12 hover:opacity-70 transition-opacity duration-300"></div>

        {/* Floating Border Elements */}
        <div className="absolute top-8 right-8 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-8 left-8 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-4 w-2 h-2 bg-red-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-16 right-4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>

        {/* Floating Donation Icons */}
        <div
          className="absolute top-40 right-24 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            className="text-red-400 fill-current animate-pulse hover:scale-110 transition-transform duration-300"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
          </svg>
        </div>

        <div
          className="absolute bottom-40 right-16 animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="text-red-300 fill-current animate-pulse hover:scale-110 transition-transform duration-300"
          >
            <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
          </svg>
        </div>
      </div>

      {/* Main Header Container with Transparent Paper Filter */}
      <div
        style={{
          backgroundImage: `url(${assets.heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "url(#filter_tornpaper)",
        }}
        className="relative min-h-[600px]"
      >
        {/* Separate Black Overlay Layer - No Paper Effect */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

        {/* Paper Effect Layer - Transparent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            filter: "url(#filter_tornpaper)",
            backgroundColor: "transparent",
          }}
        ></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-10 lg:px-20 py-16 md:py-24">
          {/* Top Badge */}
          <div className="mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-red-600 transition-colors duration-300 cursor-pointer">
              <span className="animate-pulse">👋</span>
              Start Donating Poor People
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
              Giving Help
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-2">
              To Those{" "}
              <span className="text-red-400 relative">
                Peoples
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-red-400 rounded-full animate-pulse"></div>
              </span>
            </h2>
            <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Who Need It.
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in-up">
            {!utoken && (
              <button
                className="group px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-900 rounded-full font-semibold text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
                onClick={handleRegisterClick}
              >
                Register Now
                <svg
                  className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <button
              className="group px-8 py-4 bg-red-500 text-white hover:bg-red-600 hover:shadow-lg rounded-full font-semibold text-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 animate-pulse"
              onClick={handleDonationClick}
            >
              Donate Us
              <svg
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        backendUrl={backendUrl}
        setUToken={setUToken}
        initialUsername={prefilledUsername}
      />

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={closeRegistrationModal}
        onSwitchToLogin={handleSwitchToLogin}
        backendUrl={backendUrl}
        onRegistrationSuccess={handleRegistrationSuccess}
      />

      <DonationModal
        isOpen={showDonationModal}
        onClose={closeDonationModal}
        backendUrl={backendUrl}
        userToken={utoken}
      />

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Hover effects for interactive elements */
        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }

        .hover\\:opacity-90:hover {
          opacity: 0.9;
        }

        .hover\\:opacity-80:hover {
          opacity: 0.8;
        }

        .hover\\:opacity-100:hover {
          opacity: 1;
        }

        .hover\\:opacity-70:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default Header;
