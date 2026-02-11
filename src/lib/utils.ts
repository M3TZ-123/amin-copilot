import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTND(amount: number | string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toFixed(3)} TND`;
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy HH:mm");
}
