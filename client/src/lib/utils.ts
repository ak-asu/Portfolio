import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnumValues<T extends Record<string, unknown>>(
  e: T,
): T[keyof T][] {
  return Object.values(e) as T[keyof T][];
}

/**
 * Get the correct asset path for the current environment
 * Handles both development and production (GitHub Pages) paths
 */
export function getAssetPath(path: string): string {
  const basePath = import.meta.env.BASE_URL || "/";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath}${cleanPath}`;
}

/**
 * Get image asset path
 */
export function getImagePath(imageName: string): string {
  return getAssetPath(`images/${imageName}`);
}

/**
 * Get audio asset path
 */
export function getAudioPath(audioName: string): string {
  return getAssetPath(`audio/${audioName}`);
}
