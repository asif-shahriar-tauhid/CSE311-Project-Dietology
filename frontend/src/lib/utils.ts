import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pushAppNotification(
  title: string,
  message: string,
  type: 'nutrition' | 'glucose' | 'sleep' | 'env'
) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('push_notification', {
      detail: {
        id: Date.now().toString(),
        title,
        message,
        time: 'Just now',
        type,
        read: false,
      },
    });
    window.dispatchEvent(event);
  }
}
