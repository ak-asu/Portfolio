import { create } from "zustand";

type ViewMode = "visual" | "terminal";
type Section =
  | "home"
  | "skills"
  | "projects"
  | "work"
  | "education"
  | "achievements"
  | "games";

interface AppState {
  viewMode: ViewMode;
  animationEnabled: boolean;
  soundEnabled: boolean;
  activeSection: Section;

  setViewMode: (mode: ViewMode) => void;
  setAnimationEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveSection: (section: Section) => void;
  toggleViewMode: () => void;
  toggleSound: () => void;
  toggleAnimation: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: "visual",
  animationEnabled: true,
  soundEnabled: false,
  activeSection: "home",

  setViewMode: (mode) => set({ viewMode: mode }),
  setAnimationEnabled: (enabled) => set({ animationEnabled: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setActiveSection: (section) => {
    // Update URL hash when section changes
    window.location.hash = section;
    set({ activeSection: section });
  },
  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "visual" ? "terminal" : "visual",
    })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleAnimation: () =>
    set((state) => ({ animationEnabled: !state.animationEnabled })),
}));
