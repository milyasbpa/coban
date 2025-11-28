"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LogOut, ChevronDown, RotateCcw } from "lucide-react";
import { Avatar } from "@/pwa/core/components/avatar";
import { cn } from "@/pwa/core/lib/utils";
import { User } from "@/pwa/features/login/store";
import { useKanjiScoreStore } from "@/pwa/features/score/store/kanji-score.store";
import { useVocabularyScoreStore } from "@/pwa/features/score/store/vocabulary-score.store";
import { useToast } from "@/pwa/core/components/toast";

interface UserDropdownProps {
  user: User | null;
  onLogout: () => void;
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const { showToast } = useToast();
  const { resetStatistics: resetKanji } = useKanjiScoreStore();
  const { resetProgress: resetVocab } = useVocabularyScoreStore();

  const handleResetKanji = async () => {
    try {
      await resetKanji();
      showToast("Kanji statistics reset successfully", "success");
    } catch (error) {
      showToast("Failed to reset Kanji statistics", "error");
      console.error("Reset Kanji error:", error);
    }
  };

  const handleResetVocab = async () => {
    try {
      await resetVocab();
      showToast("Vocabulary statistics reset successfully", "success");
    } catch (error) {
      showToast("Failed to reset Vocabulary statistics", "error");
      console.error("Reset Vocab error:", error);
    }
  };

  const handleResetAll = async () => {
    try {
      await Promise.all([resetKanji(), resetVocab()]);
      showToast("All statistics reset successfully", "success");
    } catch (error) {
      showToast("Failed to reset all statistics", "error");
      console.error("Reset All error:", error);
    }
  };

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

          {/* Reset Statistics Items */}
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground"
            )}
            onClick={handleResetKanji}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Kanji Stats</span>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground"
            )}
            onClick={handleResetVocab}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Vocab Stats</span>
          </DropdownMenuPrimitive.Item>

          {/* Separator */}
          <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />

          {/* Reset All - Destructive */}
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "text-destructive hover:bg-destructive/10 hover:text-destructive",
              "focus:bg-destructive/10 focus:text-destructive"
            )}
            onClick={handleResetAll}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset All Stats</span>
          </DropdownMenuPrimitive.Item>

          {/* Separator */}
          <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />

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