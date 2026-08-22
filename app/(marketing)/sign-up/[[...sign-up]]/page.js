"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";

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
  const [role, setRole] = useState(null);

  if (role) {
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

          <div className="bg-white border border-border-warm rounded-xl p-6 shadow-sm">
            <SignUp unsafeMetadata={{ role }} />
          </div>
        </div>
      </div>
    );
  }

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
          <a href="/sign-in" className="text-accent hover:text-accent-600 font-medium transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
