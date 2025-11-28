"use client";

import { useAuthInitialize } from "@/pwa/features/login/hooks";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthInitialize();
  
  return <>{children}</>;
}