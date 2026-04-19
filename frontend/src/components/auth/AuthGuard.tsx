"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand hydration status
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname || "")) {
      router.push("/login");
    } else if (isAuthenticated && PUBLIC_ROUTES.includes(pathname || "")) {
      router.push("/");
    }
  }, [isAuthenticated, pathname, router, isHydrated]);

  // Wir rendern vor der Hydration nichts, um SSR Mismatches zu vermeiden (da `isAuthenticated` aus dem LocalStorage kommt)
  if (!isHydrated) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#1B2838]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // Prevent seeing flashes of protected content if not auth routing hasn't finished resolving
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname || "")) {
      return null; 
  }

  return <>{children}</>;
}
