"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

const ROLES = [
  {
    value: "TRAINEE",
    label: "Trainee",
    description: "Enroll in courses, take assessments, earn certifications",
  },
  {
    value: "TRAINER",
    label: "Trainer",
    description: "Create courses, upload resources, assess trainees",
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

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Logo className="w-12 h-12 text-accent" />
            </div>
            <h1 className="font-display text-display-md text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose how you&apos;ll use Capacity Connect
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className="card-shell group"
              >
                <div className="card p-5 text-left h-full group-hover:border-accent/40 transition-colors duration-300">
                  <p className="font-display text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
                    {r.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => setRole(null)}
          className="btn-tertiary mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to role selection
        </button>

        <div className="mb-6">
          <p className="text-xs font-mono text-accent uppercase tracking-wider mb-1">
            Signing up as
          </p>
          <p className="font-display text-xl text-foreground">
            {ROLES.find((r) => r.value === role)?.label}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-shell">
          <div className="card p-6 space-y-4">
            {error && (
              <div className="form-error p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {error}
              </div>
            )}
            <div className="form-field">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div className="form-field">
              <label className="label" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
                placeholder="Your name"
              />
            </div>
            <div className="form-field">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
                placeholder="Enter Password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Creating account\u2026" : "Create Account"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}