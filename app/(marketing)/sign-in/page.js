"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const token = data.data.token;
      localStorage.setItem("token", token);
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      window.location.href = "/redirect";
    } catch (err) {
      setError(err.message || "Unable to reach server. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-12 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent">
                <Logo className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-xs text-muted-foreground">
              Sign in to your Capacity Connect account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium animate-in fade-in duration-150">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5" htmlFor="email">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Email address</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="name@organization.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5" htmlFor="password">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Password</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-2 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary font-semibold hover:underline transition-all">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}