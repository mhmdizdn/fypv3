'use client';
import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, MapPin, Users, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Utils function to combine class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

// ServiceMap Component - Shows service connections across the map
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
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(121, 25, 230, ${dot.opacity * 0.8})`;
        ctx.fill();
      });
    }

    function drawServiceRoutes() {
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

// ServiceFinder SignIn Component
interface ServiceFinderSignInProps {
  onSwitchToRegister?: () => void;
}

const ServiceFinderSignIn = ({ onSwitchToRegister }: ServiceFinderSignInProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"user" | "serviceProvider" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);

  // Add error state for individual fields
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    userType: ""
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      const userType = (session.user as any).userType;
      if (userType === "admin") {
        router.push("/admin/dashboard");
      } else if (userType === "serviceProvider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/customer/index");
      }
    }
  }, [status, session, router]);

  const isAdminEmail = email === "admin@gmail.com";
  const isAdminNotFoundError = error.includes("Admin account not found");

  const handleAdminSetup = async () => {
    setIsSettingUpAdmin(true);
    setError("");
    
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.message.includes("already exists")) {
          setError("Admin account already exists. Please try signing in.");
        } else {
          throw new Error(data.message || "Failed to setup admin account");
        }
        return;
      }

      // Admin created successfully
      setError("");
      // Show success message briefly, then auto-fill credentials
      setTimeout(() => {
        setEmail("admin@gmail.com");
        setPassword("admin123");
      }, 500);
      
    } catch (err: any) {
      console.error("Admin setup error:", err);
      setError(err.message || "Failed to setup admin account");
    } finally {
      setIsSettingUpAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Add explicit validation for empty fields
    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    // Check if it's admin email
    if (email === "admin@gmail.com") {
      try {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (!result?.ok) {
          // Handle specific admin errors
          if (result?.error?.includes("password")) {
            throw new Error("Incorrect admin password. Use 'admin123' for default admin.");
          } else if (result?.error?.includes("not found")) {
            throw new Error("Admin account not found. Click 'Setup Admin Account' to create it.");
          } else {
            throw new Error(result?.error || "Admin authentication failed");
          }
        }

        router.push("/admin/dashboard");
      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message || "An error occurred during admin login");
      } finally {
        setLoading(false);
      }
      return;
    }

    // For non-admin users, validate account type AFTER checking fields
    if (!userType) {
      setError("Please select your account type (Customer or Provider)");
      setFieldErrors(prev => ({ ...prev, userType: "Please select your account type" }));
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        userType,
      });

      if (!result?.ok) {
        // Handle specific error messages
        if (result?.error) {
          setError(result.error);
        } else {
          setError("Sign in failed. Please check your credentials and account type.");
        }
        return;
      }

      if (userType === "serviceProvider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/customer/index");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        if (!value.trim()) {
          setFieldErrors(prev => ({ ...prev, email: "Email is required" }));
        } else {
          setFieldErrors(prev => ({ ...prev, email: "" }));
        }
        break;
      case 'password':
        if (!value.trim()) {
          setFieldErrors(prev => ({ ...prev, password: "Password is required" }));
        } else {
          setFieldErrors(prev => ({ ...prev, password: "" }));
        }
        break;
    }
  };

  // Update input styling to show errors
  const emailInputClasses = cn(
    "w-full h-10 px-3 py-2 bg-[#13151f] border rounded-lg placeholder:text-gray-500 text-gray-200 focus:outline-none transition-colors",
    fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-[#2a2d3a] focus:border-[#7919e6]"
  );
  const passwordInputClasses = cn(
    "w-full h-10 px-3 py-2 pr-10 bg-[#13151f] border rounded-lg placeholder:text-gray-500 text-gray-200 focus:outline-none transition-colors",
    fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-[#2a2d3a] focus:border-[#7919e6]"
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }
  
    return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl overflow-hidden rounded-2xl flex bg-[#090b13] text-white shadow-2xl"
      >
        {/* Left side - ServiceFinder Map */}
        <div className="hidden md:block w-1/2 h-[700px] relative overflow-hidden border-r border-[#1f2130]">
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
                Connect with trusted local service providers and grow your business network
              </motion.p>
              

            </div>
          </div>
        </div>
        
        {/* Right side - Sign In Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back</h1>
            <p className="text-gray-400 mb-8">Sign in to your ServiceFinder account</p>
            
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
                {/* Admin Setup Button for Admin Not Found Error */}
                {isAdminEmail && isAdminNotFoundError && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleAdminSetup}
                      disabled={isSettingUpAdmin}
                      className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm transition-colors disabled:opacity-50"
                    >
                      {isSettingUpAdmin ? "Setting up..." : "Setup Admin Account"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Success Message for Admin Setup */}
            {isAdminEmail && !error && isSettingUpAdmin === false && email === "admin@gmail.com" && password === "admin123" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
              >
                Admin account created successfully! You can now sign in.
              </motion.div>
            )}

            {/* Admin Notice */}
            {isAdminEmail && !isAdminNotFoundError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm"
              >
                Admin login detected. You will be redirected to the admin dashboard.
                <div className="mt-2 text-xs text-blue-300">
                  Default credentials: admin@gmail.com / admin123
                </div>
              </motion.div>
            )}

            {/* User Type Selection */}
            {!isAdminEmail && (
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
                    onClick={() => {
                      setUserType("user");
                      setFieldErrors(prev => ({ ...prev, userType: "" }));
                      setError("");
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                      userType === "user"
                        ? "border-[#7919e6] bg-[#7919e6]/10 text-[#7919e6]"
                        : "border-[#2a2d3a] bg-[#13151f] text-gray-400 hover:border-[#7919e6]/50"
                    )}
                  >
                    <Users className="w-5 h-5 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Customer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserType("serviceProvider");
                      setFieldErrors(prev => ({ ...prev, userType: "" }));
                      setError("");
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-center",
                      userType === "serviceProvider"
                        ? "border-[#7919e6] bg-[#7919e6]/10 text-[#7919e6]"
                        : "border-[#2a2d3a] bg-[#13151f] text-gray-400 hover:border-[#7919e6]/50"
                    )}
                  >
                    <Star className="w-5 h-5 mx-auto mb-2" />
                    <div className="font-semibold text-sm">Provider</div>
                  </button>
                </div>
                {fieldErrors.userType && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 text-center"
                  >
                    {fieldErrors.userType}
                  </motion.p>
                )}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-[#7919e6]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className={emailInputClasses}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password <span className="text-[#7919e6]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={(e) => validateField('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={passwordInputClasses}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}
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
                  disabled={loading}
                  className={cn(
                    "w-full h-12 bg-gradient-to-r relative overflow-hidden from-[#7919e6] to-purple-600 hover:from-[#621ac1] hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                    isHovered ? "shadow-lg shadow-[#7919e6]/25" : ""
                  )}
                >
                  <span className="flex items-center justify-center">
                    {loading ? "Signing in..." : "Sign in"}
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
                  onClick={() => router.push("/register")}
                  className="text-[#7919e6] hover:text-purple-400 text-sm transition-colors"
                >
                  Don't have an account? Create one
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceFinderSignIn; 