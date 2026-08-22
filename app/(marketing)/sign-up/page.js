"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
      <div className="flex-1 flex items-center justify-center p-4 bg-surface">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg gradient-accent-bar mx-auto mb-4" />
            <h1 className="font-display text-display-md text-primary mb-2">
              Create your account
            </h1>
            <p className="text-muted text-sm">
              Choose how you&apos;ll use Capacity Connect
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className="group text-left p-5 bg-white border border-border-warm rounded-xl
                  transition-all duration-200
                  hover:border-accent hover:shadow-md hover:-translate-y-0.5
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <p className="font-display text-lg text-ink mb-1 group-hover:text-primary transition-colors">
                  {r.label}
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  {r.description}
                </p>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted mt-8">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-accent hover:text-accent-600 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        <button
          onClick={() => setRole(null)}
          className="text-sm text-muted hover:text-ink mb-6 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>

        <div className="mb-6">
          <p className="text-xs font-mono text-accent uppercase tracking-wider mb-1">
            Signing up as
          </p>
          <p className="font-display text-xl text-primary">
            {ROLES.find((r) => r.value === role)?.label}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border-warm rounded-xl p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
                    </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted mt-8">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-accent hover:text-accent-600 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
