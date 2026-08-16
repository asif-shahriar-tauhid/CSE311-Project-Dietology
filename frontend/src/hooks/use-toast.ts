"use client"

import { toast as toastManager } from "@/components/ui/toast"

export type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

export function toast(props: { title?: string; description?: string; variant?: string }) {
  try {
    toastManager.add({
      title: props.title,
      description: props.description,
      type: props.variant === "destructive" ? "error" : "success"
    })
  } catch (e) {
    console.log("Toast:", props.title, props.description)
  }
}

export function useToast() {
  return {
    toast,
    dismiss: () => {}
  }
}
