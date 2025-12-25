import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLabel(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).replace(",", "");
}
