import React, { useEffect, useRef } from "react";
// @ts-ignore
import Lenis from "lenis";

export default function SmoothScroller({ children }: { children?: React.ReactNode }) {
  const lenisRef = useRef<any | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <div className="w-full h-full">{children}</div>;
}