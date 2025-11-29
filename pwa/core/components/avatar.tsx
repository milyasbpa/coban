"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/pwa/core/lib/utils";

interface AvatarProps {
  email: string | null;
  className?: string;
}

function getInitials(email: string | null): string {
  if (!email) return "U";
  
  // Get first letter of email before @
  const username = email.split("@")[0];
  
  // If username has multiple parts (john.doe), get first letter of each
  const parts = username.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  // Otherwise just get first 2 letters
  return username.substring(0, 2).toUpperCase();
}

export function Avatar({ email, className }: AvatarProps) {
  const initials = getInitials(email);

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary",
        className
      )}
    >
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium"
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}