import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Sun, Moon, Laptop } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';
import {
  setAnimationLevel,
  setThemeMode,
  toggleSound,
  togglePhysics,
  type AnimationLevel,
  type ThemeMode,
} from '@/store/features/modeSlice';
import type { RootState } from '@/store/store';

export const SettingsPanel = () => {
  const dispatch = useDispatch();
  const {
    animationLevel,
    themeMode,
    soundEnabled,
    physicsEnabled,
  } = useSelector((state: RootState) => state.mode);

  return (
    <Sheet>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Settings className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Open settings</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Customize your experience</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <div 
          className="py-4 space-y-6"
          role="group"
          aria-label="Portfolio settings"
        >
          <div className="space-y-2">
            <label 
              className="text-sm font-medium"
              id="animation-level-label"
            >
              Animation Level
            </label>
            <Select
              value={animationLevel}
              onValueChange={(value: AnimationLevel) => {
                dispatch(setAnimationLevel(value));
                // Announce change to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('class', 'sr-only');
                announcement.textContent = `Animation level set to ${value}`;
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 1000);
              }}
              aria-labelledby="animation-level-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animation level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label 
              className="text-sm font-medium"
              id="theme-mode-label"
            >
              Theme
            </label>
            <Select
              value={themeMode}
              onValueChange={(value: ThemeMode) => {
                dispatch(setThemeMode(value));
                // Announce change to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('class', 'sr-only');
                announcement.textContent = `Theme set to ${value}`;
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 1000);
              }}
              aria-labelledby="theme-mode-label"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" aria-hidden="true" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" aria-hidden="true" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" aria-hidden="true" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-medium"
              id="sound-toggle-label"
            >
              Sound
            </span>
            <Toggle
              pressed={soundEnabled}
              onPressedChange={() => {
                dispatch(toggleSound());
                // Announce change to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('class', 'sr-only');
                announcement.textContent = `Sound ${soundEnabled ? 'disabled' : 'enabled'}`;
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 1000);
              }}
              aria-labelledby="sound-toggle-label"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {soundEnabled ? 'Disable sound' : 'Enable sound'}
              </span>
            </Toggle>
          </div>

          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-medium"
              id="physics-toggle-label"
            >
              Physics Effects
            </span>
            <Toggle
              pressed={physicsEnabled}
              onPressedChange={() => {
                dispatch(togglePhysics());
                // Announce change to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('class', 'sr-only');
                announcement.textContent = `Physics effects ${physicsEnabled ? 'disabled' : 'enabled'}`;
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 1000);
              }}
              aria-labelledby="physics-toggle-label"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};