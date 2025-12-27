import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { useAudioSystem } from "@/hooks/useAudioSystem";
import { Monitor, Layers, Volume2, VolumeX, Sparkles, Zap } from "lucide-react";

type Section =
  | "home"
  | "skills"
  | "projects"
  | "work"
  | "education"
  | "achievements"
  | "games";

const navItems: { id: Section; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "games", label: "Games" },
];

export const Navbar = () => {
  const {
    activeSection,
    setActiveSection,
    viewMode,
    toggleViewMode,
    soundEnabled,
    toggleSound,
    animationEnabled,
    toggleAnimation,
  } = useAppStore();
  const { playClick, playHover, playToggle } = useAudioSystem();

  // Sync with hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as Section;
    if (hash && navItems.some((item) => item.id === hash)) {
      setActiveSection(hash);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "") as Section;
      if (newHash && navItems.some((item) => item.id === newHash)) {
        setActiveSection(newHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveSection]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Main Nav Container - styled like the projects controls panel */}
      <div
        className="iron-panel px-4 py-2 flex flex-wrap items-center justify-center gap-2"
        style={{
          boxShadow:
            "0 0 30px hsl(44 98% 39% / 0.3), inset 0 1px 0 hsl(44 90% 55% / 0.3)",
        }}
      >
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2 px-3 py-1 border-r border-iron-gold/30 mr-2"
        >
          <div
            className="w-2 h-2 rounded-full bg-arc-blue animate-pulse"
            style={{ boxShadow: "0 0 8px hsl(195 100% 50%)" }}
          />
          <span className="font-orbitron text-sm font-bold text-iron-gold uppercase tracking-wider">
            Home
          </span>
        </a>

        {/* Nav Items */}
        {navItems
          .filter((item) => item.id !== "home")
          .map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                playClick();
                setActiveSection(item.id);
              }}
              onMouseEnter={playHover}
              className={`relative px-4 py-2 font-orbitron text-xs uppercase tracking-wider rounded-full transition-all duration-300 ${
                activeSection === item.id
                  ? "bg-arc-blue/20 text-arc-blue border border-arc-blue/50"
                  : "text-iron-gold hover:text-arc-blue hover:bg-iron-gold/10"
              }`}
              style={
                activeSection === item.id
                  ? {
                      boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)",
                    }
                  : {}
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-arc-blue"
                  layoutId="navIndicator"
                  style={{ boxShadow: "0 0 8px hsl(195 100% 50%)" }}
                />
              )}
            </motion.button>
          ))}

        <div className="w-px h-6 bg-iron-gold/30 mx-2" />

        {/* Mode Toggle */}
        <motion.button
          onClick={() => {
            playToggle();
            toggleViewMode();
          }}
          onMouseEnter={playHover}
          className={`relative p-2 rounded-full transition-all duration-300 ${
            viewMode === "terminal"
              ? "bg-arc-blue/20 text-arc-blue border border-arc-blue/50"
              : "text-iron-gold hover:text-arc-blue hover:bg-iron-gold/10"
          }`}
          style={
            viewMode === "terminal"
              ? {
                  boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)",
                }
              : {}
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={viewMode === "terminal" ? "Terminal Mode" : "Visual 3D Mode"}
        >
          {viewMode === "terminal" ? (
            <Monitor size={16} />
          ) : (
            <Layers size={16} />
          )}
        </motion.button>

        {/* Sound Toggle */}
        <motion.button
          onClick={() => {
            playClick();
            toggleSound();
          }}
          onMouseEnter={playHover}
          className={`relative p-2 rounded-full transition-all duration-300 ${
            soundEnabled
              ? "bg-arc-blue/20 text-arc-blue border border-arc-blue/50"
              : "text-iron-gold hover:text-arc-blue hover:bg-iron-gold/10"
          }`}
          style={
            soundEnabled
              ? {
                  boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)",
                }
              : {}
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={soundEnabled ? "Sound ON" : "Sound OFF"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </motion.button>

        {/* Animation Toggle */}
        <motion.button
          onClick={() => {
            playClick();
            toggleAnimation();
          }}
          onMouseEnter={playHover}
          className={`relative p-2 rounded-full transition-all duration-300 ${
            animationEnabled
              ? "bg-arc-blue/20 text-arc-blue border border-arc-blue/50"
              : "text-iron-gold hover:text-arc-blue hover:bg-iron-gold/10"
          }`}
          style={
            animationEnabled
              ? {
                  boxShadow: "0 0 15px hsl(195 100% 50% / 0.3)",
                }
              : {}
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={animationEnabled ? "Animations ON" : "Animations OFF"}
        >
          {animationEnabled ? <Sparkles size={16} /> : <Zap size={16} />}
        </motion.button>
      </div>
    </motion.nav>
  );
};
