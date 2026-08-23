"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-card-lg bg-ink flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-display text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-display-md text-ink mb-2">
            Welcome back
          </h1>
          <p className="text-white text-sm">
            Sign in to Capacity Connect
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-shell"
        >
          <div className="card p-6 space-y-4">
            {error && (
              <div className="form-error p-3 rounded-button bg-red-50 text-red-600 text-sm">
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
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? "Signing in\u2026" : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-accent hover:text-accent-600 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}