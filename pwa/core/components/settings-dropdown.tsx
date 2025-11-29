"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Settings, Sun, Moon, Edit3, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/pwa/core/lib/utils";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import ReactCountryFlag from "react-country-flag";

interface DisplayOption {
  key: string;
  label: string;
  description: string;
  isActive: boolean;
  toggle: () => void;
}

interface SettingsDropdownProps {
  /**
   * Selection mode state and toggle function
   */
  isSelectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  /**
   * Display options configuration
   */
  displayOptions?: DisplayOption[];
  onResetDisplayOptions?: () => void;
  /**
   * Show display options section
   */
  showDisplayOptions?: boolean;
}

export function SettingsDropdown({
  isSelectionMode,
  onToggleSelectionMode,
  displayOptions,
  onResetDisplayOptions,
  showDisplayOptions = false,
}: SettingsDropdownProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4 text-foreground" />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 min-w-[200px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          sideOffset={5}
          align="end"
        >
          {/* Header */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
            Settings
          </div>

          {/* Theme Toggle */}
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-2 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground"
            )}
            onClick={() => toggleTheme()}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span>Theme</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isDarkMode ? "Dark" : "Light"}
            </span>
          </DropdownMenuPrimitive.Item>

          {/* Language Toggle */}
          <DropdownMenuPrimitive.Item
            className={cn(
              "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-2 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground"
            )}
            onClick={toggleLanguage}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm overflow-hidden border border-border/50 flex items-center justify-center">
                <ReactCountryFlag
                  countryCode={language === "id" ? "ID" : "US"}
                  svg
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <span>Language</span>
            </div>
            <span className="text-xs text-muted-foreground uppercase">
              {language}
            </span>
          </DropdownMenuPrimitive.Item>

          {/* Selection Mode Toggle (if provided) */}
          {onToggleSelectionMode && (
            <DropdownMenuPrimitive.Item
              className={cn(
                "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-2 text-sm outline-none transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground"
              )}
              onClick={onToggleSelectionMode}
            >
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                <span>Selection Mode</span>
              </div>
              <div
                className={cn(
                  "w-8 h-4 rounded-full transition-colors relative",
                  isSelectionMode ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-background transition-transform",
                    isSelectionMode ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
            </DropdownMenuPrimitive.Item>
          )}

          {/* Display Options Section */}
          {showDisplayOptions && displayOptions && (
            <>
              <DropdownMenuPrimitive.Separator className="h-px bg-border my-1" />

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3 w-3" />
                  <span>Display Options</span>
                </div>
                {onResetDisplayOptions && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetDisplayOptions();
                    }}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>

              {displayOptions.map((option) => (
                <DropdownMenuPrimitive.Item
                  key={option.key}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground"
                  )}
                  onClick={option.toggle}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-8 h-4 rounded-full transition-colors relative",
                      option.isActive ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-3 h-3 rounded-full bg-background transition-transform",
                        option.isActive ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </DropdownMenuPrimitive.Item>
              ))}
            </>
          )}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
