'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import ServiceFinderSignIn from "./servicefinder-signin";
import ServiceFinderRegister from "./servicefinder-register";

const AuthCardContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

    return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] p-4">
      <div className="relative w-full max-w-6xl" style={{ perspective: "1000px" }}>
        <motion.div
          animate={{ rotateY: isLogin ? 0 : 180 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Login Side (Front) */}
          <div 
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(0deg)"
            }}
          >
            <ServiceFinderSignIn onSwitchToRegister={handleSwitchToRegister} />
          </div>

          {/* Register Side (Back) */}
          <div 
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <ServiceFinderRegister onSwitchToLogin={handleSwitchToLogin} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthCardContainer; 