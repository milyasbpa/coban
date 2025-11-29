"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Settings, Sun, Moon, Edit3, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/pwa/core/lib/utils";
import { useTheme } from "@/pwa/core/lib/hooks/use-theme";
import { useLanguage } from "@/pwa/core/lib/hooks/use-language";
import ReactCountryFlag from "react-country-flag";
import { ReactNode } from "react";

interface DisplayOption {
  key: string;
  label: string;
  description: string;
  isActive: boolean;
  toggle: () => void;
}

interface SettingsSection {
  id: string;
  title?: string;
  icon?: ReactNode;
  items: SettingsItem[];
  showReset?: boolean;
  onReset?: () => void;
}

interface SettingsItem {
  id: string;
  type: "toggle" | "switch" | "action";
  label: string;
  description?: string;
  icon?: ReactNode;
  value?: string | boolean;
  isActive?: boolean;
  onClick?: () => void;
}

interface SettingsDropdownProps {
  /**
   * Show default theme toggle
   */
  showTheme?: boolean;
  /**
   * Show default language toggle
   */
  showLanguage?: boolean;
  /**
   * Custom sections to add to the dropdown
   */
  customSections?: SettingsSection[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function SettingsDropdown({
  showTheme = true,
  showLanguage = true,
  customSections = [],
  className,
}: SettingsDropdownProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
            className
          )}
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

          {/* Default Theme Toggle */}
          {showTheme && (
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
          )}

          {/* Default Language Toggle */}
          {showLanguage && (
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
          )}

          {/* Custom Sections */}
          {customSections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Separator before custom sections if there are default items */}
              {(showTheme || showLanguage || sectionIndex > 0) && (
                <DropdownMenuPrimitive.Separator className="h-px bg-border my-1" />
              )}

              {/* Section Title */}
              {section.title && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  {section.showReset && section.onReset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        section.onReset?.();
                      }}
                      className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Section Items */}
              {section.items.map((item) => (
                <DropdownMenuPrimitive.Item
                  key={item.id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 text-sm outline-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    item.description ? "py-1.5" : "py-2"
                  )}
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="text-sm">{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Render based on type */}
                  {item.type === "toggle" && typeof item.value === "string" && (
                    <span className="text-xs text-muted-foreground">
                      {item.value}
                    </span>
                  )}

                  {item.type === "switch" && typeof item.isActive === "boolean" && (
                    <div
                      className={cn(
                        "w-8 h-4 rounded-full transition-colors relative shrink-0",
                        item.isActive ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-3 h-3 rounded-full bg-background transition-transform",
                          item.isActive ? "translate-x-4" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  )}
                </DropdownMenuPrimitive.Item>
              ))}
            </div>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
