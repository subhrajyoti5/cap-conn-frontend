"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  GraduationCap,
  Presentation,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const ROLES = [
  {
    value: "TRAINEE",
    label: "Trainee",
    badge: "Learn & Upskill",
    description: "Enroll in courses, take assessments, and earn verifiable certifications.",
    icon: GraduationCap,
  },
  {
    value: "TRAINER",
    label: "Trainer",
    badge: "Instruct & Manage",
    description: "Build courses, share learning resources, and evaluate trainee progress.",
    icon: Presentation,
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/pending");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-12 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20 text-accent">
                <Logo className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-xs text-muted-foreground">
              {role ? `Complete details to register as ${ROLES.find(r => r.value === role)?.label}` : "Choose how you will use Capacity Connect"}
            </p>
          </div>

          {!role ? (
            /* Role Selection Screen */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className="group relative p-5 bg-background border border-border/80 rounded-2xl text-left hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="badge bg-muted text-muted-foreground border-border text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {r.badge}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-bold text-foreground group-hover:text-accent transition-colors">
                          {r.label}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {r.description}
                        </p>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Get Started</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-accent font-semibold hover:underline transition-all">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Registration Form Screen */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between bg-muted/40 border border-border/60 p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    Registering as <span className="text-primary font-bold">{ROLES.find((r) => r.value === role)?.label}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs border border-destructive/20 font-medium animate-in fade-in duration-150">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5" htmlFor="name">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Full name</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>

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
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Min 6 characters"
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
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-primary font-semibold hover:underline transition-all">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}