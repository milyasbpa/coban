"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "@/pwa/core/components/avatar";
import { cn } from "@/pwa/core/lib/utils";
import { User } from "@/pwa/features/login/store";

interface UserDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-md hover:bg-accent p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="User menu"
        >
          <Avatar email={user?.email || null} />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          sideOffset={5}
          align="end"
        >
          {/* User Email Info */}
          <div className="px-2 py-1.5 text-sm text-muted-foreground border-b border-border mb-1">
            <p className="truncate">{user?.email || "User"}</p>
          </div>

          {/* Logout Item */}
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground",
              "data-disabled:pointer-events-none data-disabled:opacity-50"
            )}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}