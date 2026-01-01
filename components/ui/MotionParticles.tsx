
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function MotionParticles() {
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Generate 25 random particles
  const particles = Array.from({ length: 25 });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((_, i) => (
        <Particle 
          key={i} 
          index={i} 
          mouseX={smoothX} 
          mouseY={smoothY} 
          width={windowSize.w} 
          height={windowSize.h} 
        />
      ))}
    </div>
  );
}

function Particle({ index, mouseX, mouseY, width, height }: any) {
  const randomX = Math.random() * width - width / 2;
  const randomY = Math.random() * height - height / 2;
  const size = Math.random() * 3 + 1; 
  
  const depth = (index % 5) + 1; 
  const x = useTransform(mouseX, (val: number) => randomX + (val / (depth * 15)));
  const y = useTransform(mouseY, (val: number) => randomY + (val / (depth * 15)));

  return (
    <motion.div
      style={{ x, y, width: size, height: size }}
      className="absolute top-1/2 left-1/2 rounded-full bg-teal-400/30 blur-[1px]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.1, 0.4, 0.1], 
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: Math.random() * 4 + 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2
      }}
    >
      <div 
        style={{ width: size, height: size }} 
        className="rounded-full bg-white shadow-[0_0_8px_rgba(20,184,166,0.4)]" 
      />
    </motion.div>
  );
}
