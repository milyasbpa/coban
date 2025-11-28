"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/pwa/core/lib/utils";
import { createContext, useContext, useState, ReactNode } from "react";

// Toast Context
interface ToastContextType {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Toast Provider
interface ToastProviderProps {
  children: ReactNode;
}

interface ToastData {
  id: string;
  message: string;
  type: "success" | "error";
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open={true}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
              "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
              toast.type === "success"
                ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                : "border-destructive/50 bg-destructive/10 text-destructive"
            )}
          >
            <ToastPrimitive.Description className="text-sm font-medium">
              {toast.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close
              className={cn(
                "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
                toast.type === "success"
                  ? "text-green-600 hover:text-green-700 dark:text-green-400"
                  : "text-destructive hover:text-destructive/90"
              )}
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}