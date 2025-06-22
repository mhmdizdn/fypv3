'use client';
import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, MapPin, Users, Star, UserPlus, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Utils function to combine class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// ServiceMap Component - Shows service connections across the map (same as login)
type ServicePoint = {
  x: number;
  y: number;
  delay: number;
  service: string;
};

const ServiceMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up service routes that will animate across the map
  const serviceRoutes: { start: ServicePoint; end: ServicePoint; color: string; service: string }[] = [
    {
      start: { x: 80, y: 120, delay: 0, service: "Cleaning" },
      end: { x: 180, y: 80, delay: 2, service: "Plumbing" },
      color: "#7919e6",
      service: "Home Services"
    },
    {
      start: { x: 200, y: 90, delay: 1, service: "Electrical" },
      end: { x: 280, y: 140, delay: 3, service: "Tutoring" },
      color: "#7919e6",
      service: "Professional Services"
    },
    {
      start: { x: 60, y: 60, delay: 0.5, service: "Repair" },
      end: { x: 160, y: 160, delay: 2.5, service: "Delivery" },
      color: "#7919e6",
      service: "Local Services"
    },
    {
      start: { x: 260, y: 70, delay: 1.5, service: "Beauty" },
      end: { x: 160, y: 180, delay: 3.5, service: "Fitness" },
      color: "#7919e6",
      service: "Personal Services"
    },
  ];

  // Create dots for the service network
  const generateServiceDots = (width: number, height: number) => {
    const dots = [];
    const gap = 15;
    const dotRadius = 1.5;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Create a network pattern representing service coverage
        const isInServiceArea =
          // Urban areas with high service density
          ((x < width * 0.3 && x > width * 0.1) && 
           (y < height * 0.4 && y > height * 0.2)) ||
          // Suburban coverage
          ((x < width * 0.6 && x > width * 0.3) && 
           (y < height * 0.7 && y > height * 0.3)) ||
          // Extended service areas
          ((x < width * 0.8 && x > width * 0.5) && 
           (y < height * 0.6 && y > height * 0.2)) ||
          // Additional coverage zones
          ((x < width * 0.9 && x > width * 0.7) && 
           (y < height * 0.8 && y > height * 0.5));

        if (isInServiceArea && Math.random() > 0.4) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.6 + 0.2,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateServiceDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function drawDots() {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(121, 25, 230, ${dot.opacity * 0.8})`;
        ctx.fill();
      });
    }

    function drawServiceRoutes() {
      if (!ctx) return;
      const currentTime = (Date.now() - startTime) / 1000;
      
      serviceRoutes.forEach(route => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        
        const duration = 4;
        const progress = Math.min(elapsed / duration, 1);
        
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;
        
        // Draw the service connection line
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Draw service hubs
        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
        
        // Draw the moving service indicator
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#60a5fa";
        ctx.fill();
        
        // Add glow effect
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(121, 25, 230, 0.3)";
        ctx.fill();
        
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }
    
    function animate() {
      drawDots();
      drawServiceRoutes();
      
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 20) {
        startTime = Date.now();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

// ServiceFinder Register Component
interface ServiceFinderRegisterProps {
  onSwitchToLogin?: () => void;
}

const ServiceFinderRegister = ({ onSwitchToLogin }: ServiceFinderRegisterProps) => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    serviceType: ""
  });
  const [userType, setUserType] = useState<"user" | "serviceProvider" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userType) {
      setError("Please select a user type");
      return;
    }
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const body: any = { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password, 
        username: formData.username, 
        userType 
      };
      if (userType === "serviceProvider") {
        body.serviceType = formData.serviceType;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Sign in user immediately after registration
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        userType,
      });

      if (signInResult?.ok) {
        // Redirect based on user type
        if (userType === "serviceProvider") {
          router.push("/provider/dashboard");
        } else {
          router.push("/customer/index");
        }
      } else {
        throw new Error(signInResult?.error || "Login failed after registration");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
    return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl"
      >
        {/* Left side - ServiceFinder Map */}
        <div className="hidden md:block w-1/2 h-[800px] relative overflow-hidden border-r border-[#1f2130]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1120] to-[#151929]">
            <ServiceMap />
            
            {/* ServiceFinder branding overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6"
              >
                <Image
                  src="/servicefinder-logo.png"
                  alt="ServiceFinder Logo"
                  width={64}
                  height={64}
                />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-4xl font-bold mb-3 text-center"
              >
                <span className="text-white">Service</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7919e6] to-purple-500">Finder</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-sm text-center text-gray-400 max-w-xs mb-8"
              >
                Join our growing community of service providers and customers. Start your journey today!
              </motion.p>
            </div>
          </div>
        </div>
        
        {/* Right side - Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center max-h-[800px] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Create Account</h1>
            <p className="text-gray-400 mb-6">Join ServiceFinder today</p>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* User Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-300 mb-3">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("user")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                    userType === "user"
                      ? "border-[#7919e6] bg-[#7919e6]/10 text-[#7919e6]"
                      : "border-[#2a2d3a] bg-[#13151f] text-gray-400 hover:border-[#7919e6]/50"
                  )}
                >
                  <UserPlus className="w-5 h-5 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Customer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("serviceProvider")}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                    userType === "serviceProvider"
                      ? "border-[#7919e6] bg-[#7919e6]/10 text-[#7919e6]"
                      : "border-[#2a2d3a] bg-[#13151f] text-gray-400 hover:border-[#7919e6]/50"
                  )}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Provider</div>
                </button>
              </div>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name and Username Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name <span className="text-[#7919e6]">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full h-10 px-3 py-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username <span className="text-[#7919e6]">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    required
                    className="w-full h-10 px-3 py-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Service Type (only for service providers) */}
              {userType === "serviceProvider" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-300 mb-1">
                    Service Type <span className="text-[#7919e6]">*</span>
                  </label>
                  <input
                    id="serviceType"
                    name="serviceType"
                    type="text"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    placeholder="e.g., Plumbing, Cleaning, Electrical"
                    required
                    className="w-full h-10 px-3 py-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                  />
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-[#7919e6]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-10 px-3 py-2 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                />
              </div>
              
              {/* Password Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password <span className="text-[#7919e6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password"
                      required
                      className="w-full h-10 px-3 py-2 pr-10 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm <span className="text-[#7919e6]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                      className="w-full h-10 px-3 py-2 pr-10 bg-[#13151f] border border-[#2a2d3a] rounded-lg placeholder:text-gray-500 text-gray-200 focus:border-[#7919e6] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                      onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      {isConfirmPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="pt-2"
              >
                <button
                  type="submit"
                  disabled={loading || !userType}
                  className={cn(
                    "w-full h-12 bg-gradient-to-r relative overflow-hidden from-[#7919e6] to-purple-600 hover:from-[#621ac1] hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                    isHovered ? "shadow-lg shadow-[#7919e6]/25" : ""
                  )}
                >
                  <span className="flex items-center justify-center">
                    {loading ? "Creating Account..." : "Create Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </span>
                  {isHovered && !loading && (
                    <motion.span
                      initial={{ left: "-100%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ filter: "blur(8px)" }}
                    />
                  )}
                </button>
              </motion.div>
              
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-[#7919e6] hover:text-purple-400 text-sm transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceFinderRegister; 