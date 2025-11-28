"use client";

import { ThemeToggleButton } from "@/pwa/core/components/theme-toggle-button";
import { UserDropdown } from "@/pwa/features/home/components/user-dropdown";
import { useLoginStore } from "@/pwa/features/login/store";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import Image from "next/image";

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout: storeLogout } = useLoginStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      storeLogout();
      // Stay on current page, just update auth state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border/40">
      <div className="flex justify-between items-center px-4 py-4">
        <div className="flex justify-start items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-medium">Coban</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <ThemeToggleButton />
              <UserDropdown user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <ThemeToggleButton />
              <button
                onClick={handleLogin}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Login"
              >
                <User className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
