"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/pwa/core/config/firebase";
import { useLoginStore } from "../store/login.store";
import { useRouter } from "next/navigation";

export function LoginContainer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading, error, setLoading, setError, loginSuccess, clearError, isAuthenticated, isInitialized } =
    useLoginStore();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      clearError();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      loginSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Redirect to home after successful login
      router.push("/");
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan saat login";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Email tidak ditemukan";
          break;
        case "auth/wrong-password":
          errorMessage = "Password salah";
          break;
        case "auth/invalid-email":
          errorMessage = "Format email tidak valid";
          break;
        case "auth/user-disabled":
          errorMessage = "Akun telah dinonaktifkan";
          break;
        default:
          errorMessage = error.message || "Terjadi kesalahan saat login";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-6 shadow-lg"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Login</h1>
            <p className="text-muted-foreground text-sm">
              Masuk ke akun Coban Anda
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masukkan@email.com"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password anda"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Masuk..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
