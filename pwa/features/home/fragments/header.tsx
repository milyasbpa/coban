"use client";

import { AppHeader } from "@/pwa/core/components/app-header";
import { useLoginStore } from "@/pwa/features/login/store";
import { signOut } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import { useRouter } from "next/navigation";

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
    <AppHeader
      leftSide={{
        type: "logo",
        src: "/logo.png",
        alt: "Logo",
        label: "Coban",
      }}
      showSettings={true}
      settingsConfig={{
        showTheme: true,
        showLanguage: true,
      }}
      showUser={true}
      userConfig={{
        isAuthenticated,
        user,
        onLogout: handleLogout,
        onLogin: handleLogin,
      }}
    />
  );
}
