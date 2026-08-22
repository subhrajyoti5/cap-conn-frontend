"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";

export default function RedirectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function resolve() {
      const meta = user?.publicMetadata || {};
      let role = meta.role;
      let status = meta.status;

      if (!role || !status) {
        try {
          const token = await getToken();
          const res = await apiFetch("/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res?.data) {
            role = res.data.role;
            status = res.data.status;
          }
        } catch {
          // user row may not exist yet (webhook race)
        }
      }

      status = status || "PENDING";
      role = role || "TRAINEE";

      if (status === "PENDING") {
        router.push("/pending");
        return;
      }

      if (status === "REJECTED" || status === "SUSPENDED") {
        router.push("/pending");
        return;
      }

      if (role === "ADMIN") router.push("/admin");
      else if (role === "TRAINER") router.push("/trainer");
      else router.push("/trainee");
    }

    resolve();
  }, [isLoaded, isSignedIn, user, getToken, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Setting up your account...</p>
      </div>
    </div>
  );
}
