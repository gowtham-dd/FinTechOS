"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/AuthModal";

export function GlobalAuthProvider({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);

  const syncUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("fintech_os_auth_user");
      if (stored) {
        setAuthUser(JSON.parse(stored));
      } else {
        setAuthUser(null);
      }
    } catch (e) {
      setAuthUser(null);
    }
  };

  useEffect(() => {
    syncUserFromStorage();

    const handleRequireAuth = (e: any) => {
      setAuthModalOpen(true);
      if (e.detail?.targetHref) {
        setPendingNavHref(e.detail.targetHref);
      }
    };

    window.addEventListener("require-auth", handleRequireAuth);
    window.addEventListener("storage", syncUserFromStorage);
    window.addEventListener("user-auth-change", syncUserFromStorage);
    return () => {
      window.removeEventListener("require-auth", handleRequireAuth);
      window.removeEventListener("storage", syncUserFromStorage);
      window.removeEventListener("user-auth-change", syncUserFromStorage);
    };
  }, []);

  const handleAuthSuccess = (token: string, user: any) => {
    localStorage.setItem("fintech_os_auth_token", token);
    localStorage.setItem("fintech_os_auth_user", JSON.stringify(user));
    setAuthUser(user);
    window.dispatchEvent(new Event("user-auth-change"));
    
    const target = pendingNavHref || "/research";
    setPendingNavHref(null);
    router.push(target);
  };

  const handleLogout = () => {
    localStorage.removeItem("fintech_os_auth_token");
    localStorage.removeItem("fintech_os_auth_user");
    setAuthUser(null);
    setAuthModalOpen(false);
    setPendingNavHref(null);
    window.dispatchEvent(new Event("user-auth-change"));
    router.push("/");
  };


  return (
    <>
      {children}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={authUser}
        onAuthSuccess={handleAuthSuccess}
        onLogout={handleLogout}
      />
    </>
  );
}
