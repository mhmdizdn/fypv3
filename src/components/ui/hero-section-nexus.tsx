'use client';

import { motion } from 'framer-motion';
import { Button } from './button';
import { useState, useEffect } from 'react';

interface HeroSectionNexusProps {
  onGetStartedClick?: () => void;
  onLearnMoreClick?: () => void;
}

export function HeroSectionNexus({ onGetStartedClick, onLearnMoreClick }: HeroSectionNexusProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<{x: number, y: number, opacity: number}[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once component mounts on client
    setIsClient(true);
    
    // Generate particles only on client-side
    const arr = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      opacity: Math.random() * 0.5,
    }));
    setParticles(arr);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
        <motion.div
          className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Content */}
      <div 
        className="relative z-10 container mx-auto px-4 py-20 text-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
            animate={{
              backgroundPosition: isHovered ? '200% center' : '0% center',
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundSize: '200% auto',
            }}
          >
            Bringing Services to Your Doorstep.
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12"
            animate={{
              opacity: isHovered ? 1 : 0.8,
              y: isHovered ? 0 : 5,
            }}
          >
            "Reliable Home Help, Just a Click Away."
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="gradient"
                size="xl"
                className="px-8 py-6"
                onClick={onGetStartedClick}
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="xl"
                className="border-white/20 text-black hover:bg-white/10 px-8 py-6"
                onClick={onLearnMoreClick}
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      
      {/* Animated Particles - Only render on client side */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => {
            // Pre-compute random values to ensure consistency
            const endY = p.y + 300;
            const endOpacity = p.opacity - 0.2;
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: p.x,
                  y: p.y,
                  opacity: p.opacity,
                }}
                animate={{
                  y: [null, endY],
                  opacity: [null, endOpacity],
                }}
                transition={{
                  duration: 10 + (i % 10),
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}