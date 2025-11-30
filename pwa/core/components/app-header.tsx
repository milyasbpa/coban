"use client";

import { ReactNode } from "react";
import { Button } from "@/pwa/core/components/button";
import { SettingsDropdown } from "@/pwa/core/components/settings-dropdown";
import { UserDropdown } from "@/pwa/features/home/components/user-dropdown";
import { User as UserIcon, LucideIcon } from "lucide-react";
import { User } from "@/pwa/features/login/store";
import { clearLastVisitedPage } from "@/pwa/core/lib/hooks/use-last-visited-page";
import Link from "next/link";
import Image from "next/image";

// Types for left side configuration
type BackButton = {
  type: "back";
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
};

type Logo = {
  type: "logo";
  src: string;
  alt?: string;
  label?: string;
};

type LeftSideConfig = BackButton | Logo;

// Settings dropdown props
type SettingsConfig = {
  showTheme?: boolean;
  showLanguage?: boolean;
  customSections?: Array<{
    id: string;
    title?: string;
    icon?: ReactNode;
    showReset?: boolean;
    onReset?: () => void;
    items: Array<{
      id: string;
      type: "toggle" | "switch" | "action";
      label: string;
      description?: string;
      icon?: ReactNode;
      value?: string;
      isActive?: boolean;
      onClick?: () => void;
    }>;
  }>;
};

// User auth props
type UserConfig = {
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
};

type AppHeaderProps = {
  leftSide?: LeftSideConfig;
  title?: string;
  showSettings?: boolean;
  settingsConfig?: SettingsConfig;
  showUser?: boolean;
  userConfig?: UserConfig;
  className?: string;
};

export function AppHeader({
  leftSide,
  title,
  showSettings = true,
  settingsConfig = { showTheme: true, showLanguage: true },
  showUser = true,
  userConfig,
  className = "",
}: AppHeaderProps) {
  return (
    <div
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40 ${className}`}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Side - Back Button/Logo & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {leftSide?.type === "back" && (
            leftSide.onClick ? (
              <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={leftSide.onClick}>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                  <leftSide.icon className="w-4 h-4" />
                </Button>
                {title && (
                  <h1 className="text-sm font-semibold text-foreground truncate">
                    {title}
                  </h1>
                )}
              </div>
            ) : (
              <Link 
                href={leftSide.href} 
                className="flex items-center gap-2 min-w-0"
                onClick={() => clearLastVisitedPage()}
              >
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                  <leftSide.icon className="w-4 h-4" />
                </Button>
                {title && (
                  <h1 className="text-sm font-semibold text-foreground truncate">
                    {title}
                  </h1>
                )}
              </Link>
            )
          )}

          {leftSide?.type === "logo" && (
            <div className="flex items-center gap-2">
              <Image
                src={leftSide.src}
                alt={leftSide.alt || "Logo"}
                width={32}
                height={32}
                className="w-8 h-8 shrink-0"
              />
              {leftSide.label && (
                <span className="font-medium">{leftSide.label}</span>
              )}
            </div>
          )}

          {!leftSide && title && (
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
          )}
        </div>

        {/* Right Side - Settings & User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Settings Dropdown */}
          {showSettings && (
            <SettingsDropdown
              showTheme={settingsConfig.showTheme}
              showLanguage={settingsConfig.showLanguage}
              customSections={settingsConfig.customSections}
            />
          )}

          {/* User Dropdown or Login Button */}
          {showUser && userConfig && (
            <>
              {userConfig.isAuthenticated ? (
                <UserDropdown
                  user={userConfig.user}
                  onLogout={userConfig.onLogout}
                />
              ) : (
                <button
                  onClick={userConfig.onLogin}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Login"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
