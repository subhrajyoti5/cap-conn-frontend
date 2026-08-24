import Link from "next/link";
import { Logo } from "@/components/logo";

const FEATURES = [
  {
    title: "Structured Course Paths",
    description: "Design comprehensive courses with modular resources, real-time media, and interactive learning streams. Trainees learn at their own pace.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Trainer Competency Mapping",
    description: "Map domain expertise to structural topics. Instantly match training cohorts with verified instructors based on matching requirements.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    title: "Secure MCQ Testing",
    description: "Create and publish auto-graded assessments. Fully server-validated scoring and instant reporting ensure integrity and progress transparency.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    title: "Verifiable Certifications",
    description: "Earn and trace professional qualifications as you finish course tracks. Share achievements with a verifiable digital record of your competence.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0c.256.047.512.093.768.139m-1.536-2.392a6.003 6.003 0 01-2.77.853m0 0a6.023 6.023 0 01-.768.139" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Register Account Role",
    description: "Sign up as a Trainee to enroll in course tracks, or as a Trainer to host programs.",
  },
  {
    step: "02",
    title: "Complete Verified Profile",
    description: "Input qualifications, experience, and certifications. Admin approval maintains directory integrity.",
  },
  {
    step: "03",
    title: "Publish, Learn & Certify",
    description: "Trainers launch materials. Trainees complete active courses and earn verifiable skill credits.",
  },
];

const STATS = [
  { value: "Enterprise-Ready", label: "LMS Architecture" },
  { value: "3 Roles", label: "Custom Workflows" },
  { value: "100% Secure", label: "Auto-Grading Engine" },
  { value: "Competency-First", label: "Skills Mapping" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 flex items-center justify-center">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="page max-w-4xl text-center space-y-8 px-4">
          <span className="badge badge-accent uppercase tracking-wider text-xs font-mono py-1 px-3">
            Next-Generation LMS
          </span>
          <h1 className="font-display text-display-xl md:text-[3.75rem] text-foreground leading-[1.05] tracking-tight max-w-3xl mx-auto">
            Build capacity, <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent font-bold">measure growth</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A state-of-the-art training management platform to deliver structured educational paths, map coordinator competencies, and track measurable outcomes.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link href="/sign-up" className="btn-primary py-2.5 px-6 shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform">
              Get Started
            </Link>
            <Link href="/sign-in" className="btn-secondary py-2.5 px-6 border border-border bg-card/60 backdrop-blur-sm">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/40 backdrop-blur-md">
        <div className="page max-w-5xl py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 px-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p className="font-display text-lg sm:text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="page max-w-5xl py-20 lg:py-28 px-4">
        <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
          <p className="text-[10px] font-mono text-accent uppercase tracking-widest">
            Platform Capabilities
          </p>
          <h2 className="font-display text-display-md sm:text-display-lg text-foreground tracking-tight">
            Everything you need for capacity building programs
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, index) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-accent/40 hover:shadow-lg transition-all duration-300 flex items-start gap-4 text-left"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                {f.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-sm font-bold text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/20 border-y border-border backdrop-blur-sm">
        <div className="page max-w-5xl py-20 lg:py-28 px-4">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
            <p className="text-[10px] font-mono text-accent uppercase tracking-widest">
              Simple Onboarding
            </p>
            <h2 className="font-display text-display-md sm:text-display-lg text-foreground tracking-tight">
              Three steps to get started
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, index) => (
              <div
                key={s.step}
                className="space-y-3 text-center sm:text-left"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/15 flex items-center justify-center font-mono text-lg text-accent font-bold mx-auto sm:mx-0">
                  {s.step}
                </div>
                <h3 className="font-display text-xs font-bold text-foreground">{s.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="page max-w-4xl py-20 px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-10 sm:p-14 text-center shadow-elevated">
          <div className="relative z-10 space-y-6 max-w-lg mx-auto">
            <h2 className="font-display text-display-md sm:text-display-lg text-white tracking-tight">
              Ready to build capacity?
            </h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Register as a trainee to complete custom course paths, or as a trainer to manage resources and issue verifiable digital credentials.
            </p>
            <div className="pt-2">
              <Link href="/sign-up" className="btn-primary py-2.5 px-6 shadow-lg hover:scale-[1.02] transition-transform inline-flex">
                Create Your Account
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="page max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-xs">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 text-accent" />
            <span className="text-sm text-foreground">Capacity Connect</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Capacity Connect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}