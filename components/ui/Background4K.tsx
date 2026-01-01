
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppMode } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';

const WALLPAPER_MAP: Record<string, string> = {
  default: "https://images.unsplash.com/photo-1552083974-186346191183?q=80&w=2070&auto=format&fit=crop", // Ocean (Default)
  onyx: "https://images.unsplash.com/photo-1534234828563-02511c59b52a?q=80&w=2000&auto=format&fit=crop", // Nebula
  royal: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop", // Gold
  corporate: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=3840&auto=format&fit=crop", // Building
  desert: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=3840&auto=format&fit=crop", // Sand
  circuit: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3840&auto=format&fit=crop" // Tech
};

const THEME_DEFAULTS: Record<string, string> = {
  ocean: 'default',
  nebula: 'onyx',
  gold: 'royal',
  arctic: 'corporate'
};

interface Background4KProps {
  mode: AppMode;
}

const Background4K: React.FC<Background4KProps> = ({ mode }) => {
  const { settings } = useSettings();
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine active wallpaper:
  // 1. Explicit setting from Settings (if valid ID)
  // 2. Fallback to Theme default
  // 3. Fallback to 'default'
  const activeWallpaperId = settings.activeWallpaper && WALLPAPER_MAP[settings.activeWallpaper] 
    ? settings.activeWallpaper 
    : THEME_DEFAULTS[theme] || 'default';

  const activeBgUrl = WALLPAPER_MAP[activeWallpaperId];

  useEffect(() => {
    setIsLoaded(false);
  }, [activeBgUrl]);

  return (
    <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden bg-slate-950 transition-colors duration-700">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeBgUrl}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* 1. Base Image Layer */}
          <img 
            src={activeBgUrl} 
            alt="Background" 
            loading="eager"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              filter: theme === 'arctic' ? "brightness(1.1)" : "brightness(0.6) contrast(1.1)"
            }}
          />

          {/* 2. Theme-Specific Overlay Logic */}
          <div 
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: theme === 'arctic' 
                ? 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.1))'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
              backdropFilter: `blur(${theme === 'nebula' ? '4px' : '12px'})`,
              WebkitBackdropFilter: `blur(${theme === 'nebula' ? '4px' : '12px'})`
            }}
          />
          
          {/* 3. Vignette */}
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-primary)_90%)] opacity-80`} />

        </motion.div>
      </AnimatePresence>

      {/* 4. Global Noise Overlay */}
      {settings.enableNoise && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-[10]"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
      )}
    </div>
  );
};

export default Background4K;
