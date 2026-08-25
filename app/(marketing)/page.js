import Link from "next/link";
import { Logo } from "@/components/logo";
import { LandingHero } from "@/components/landing-hero";
import { CardCarousel } from "@/components/card-carousel";
import { CopperShadowAura } from "@/components/copper-shadow-aura";

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
  { value: "Competency-First", label: "Skills Mapping" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Hero Section — geometric WebGL shader */}
      <LandingHero />

      {/* Stats & Trust Bar */}
      <section className="relative border-y border-border/80 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-2xl mx-auto py-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 px-4 relative z-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-0.5 group">
              <p className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                {s.value}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Features Showcase (Card Carousel) */}
      <section id="features" className="relative page max-w-6xl py-24 lg:py-32 px-4 overflow-hidden">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
          <p className="text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
            Platform Capabilities
          </p>
          <h2 className="font-display text-display-md sm:text-display-lg text-foreground tracking-tight">
            Everything you need for capacity building programs
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Hover and drag through our key platform modules engineered for educational excellence.
          </p>
        </div>

        <CardCarousel />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative bg-muted/20 border-y border-border/70 backdrop-blur-sm overflow-hidden">
        <div className="page max-w-5xl py-24 lg:py-32 px-4 relative z-10">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
            <p className="text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
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
                className="space-y-4 text-center sm:text-left p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm hover:border-accent/30 transition-colors"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center font-mono text-lg text-accent font-bold mx-auto sm:mx-0 shadow-inner">
                  {s.step}
                </div>
                <h3 className="font-display text-sm font-bold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section — Copper Shadow aura */}
      <section className="page max-w-4xl py-20 px-4">
        <CopperShadowAura className="rounded-2xl text-white p-10 sm:p-14 text-center shadow-elevated min-h-[280px]">
          <div className="space-y-6 max-w-lg mx-auto">
            <h2 className="font-display text-display-md sm:text-display-lg text-white tracking-tight">
              Ready to build capacity?
            </h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Register as a trainee to complete custom course paths, or as a trainer to manage resources and issue verifiable digital credentials.
            </p>
            <div className="pt-2">
              <Link
                href="/sign-up"
                className="btn-primary py-2.5 px-6 shadow-lg hover:scale-[1.02] transition-transform inline-flex"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </CopperShadowAura>
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