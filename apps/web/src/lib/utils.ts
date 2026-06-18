import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format = "MMM dd, yyyy") {
  const d = new Date(date);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,"0")}, ${d.getFullYear()}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-yellow-500";
  if (score >= 4) return "text-orange-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  if (score >= 6) return "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400";
  if (score >= 4) return "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400";
  return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 6) return "Average";
  if (score >= 5) return "Below Average";
  return "Needs Work";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
