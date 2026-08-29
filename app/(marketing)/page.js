import Link from "next/link";
import { Logo } from "@/components/logo";
import { LandingHero } from "@/components/landing-hero";
import { CardCarousel } from "@/components/card-carousel";
import { CopperShadowAura } from "@/components/copper-shadow-aura";

const FEATURE_CARDS = [
  {
    step: "01",
    tag: "Learning Paths",
    title: "Structured Learning Paths",
    desc: "Design organization-wide training programs with modular resources and clear progression from new joiner to role-ready employee.",
  },
  {
    step: "02",
    tag: "Trainers",
    title: "Verified Trainer Matching",
    desc: "Match training cohorts with verified instructors based on domain expertise and competency requirements.",
  },
  {
    step: "03",
    tag: "Onboarding",
    title: "Employee Onboarding",
    desc: "Onboard new joiners with structured curricula, assigned training, and measurable readiness checkpoints.",
  },
  {
    step: "04",
    tag: "Competencies",
    title: "Competency Mapping",
    desc: "Map required skills to roles and programs so organizations can track workforce capability with clarity.",
  },
  {
    step: "05",
    tag: "Assessments",
    title: "Assessments & Evaluation",
    desc: "Evaluate employee understanding with structured assessments and transparent scoring for trainers and admins.",
  },
  {
    step: "06",
    tag: "Progress",
    title: "Training Progress",
    desc: "Monitor completion across teams, programs, and individuals so leaders know where capability is building.",
  },
  {
    step: "07",
    tag: "Certificates",
    title: "Certifications",
    desc: "Issue completion credentials that confirm employees have finished required training and competency tracks.",
  },
  {
    step: "08",
    tag: "Verification",
    title: "Skill Verification",
    desc: "Verify that training and skill requirements are complete before employees advance or take on new responsibilities.",
  },
  {
    step: "09",
    tag: "Analytics",
    title: "Organization-wide Training Analytics",
    desc: "See program participation, assessment outcomes, and competency coverage across your organization in one place.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Set Up Your Organization",
    description:
      "Create the organization, define training programs, and configure roles for Admin, Trainer, and Trainee.",
  },
  {
    step: "02",
    title: "Build & Assign Training",
    description:
      "Create structured learning paths and assign training to employees or new joiners.",
  },
  {
    step: "03",
    title: "Train, Assess & Certify",
    description:
      "Employees complete training, assessments, and competency requirements while organizations track progress and verification.",
  },
];

const STATS = [
  { value: "Government & Private", label: "Organizations" },
  { value: "New Joiner → Expert", label: "Structured Training" },
  { value: "Competency-First", label: "Skill Verification" },
];

const SOLUTIONS = [
  {
    title: "Government Organizations",
    description:
      "Deliver structured employee training, onboarding, and competency verification across departments with clear auditability for Admin, Trainer, and Trainee workflows.",
  },
  {
    title: "Private Organizations",
    description:
      "Upskill teams, onboard new joiners, and measure workforce capability with organization-wide learning programs and skill verification.",
  },
  {
    title: "Admin · Trainer · Trainee",
    description:
      "Operate a clear organizational workflow: admins configure programs and roles, trainers deliver and assess, and trainees complete structured learning paths.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Hero Section — geometric WebGL shader */}
      <LandingHero />

      {/* Stats & Trust Bar */}
      <section className="relative border-y border-border/80 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto py-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 px-4 relative z-10">
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

      {/* Solutions */}
      <section id="solutions" className="relative page max-w-5xl py-20 lg:py-24 px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
            Solutions
          </p>
          <h2 className="font-display text-display-md sm:text-display-lg text-foreground tracking-tight">
            Enterprise training for organizations
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Capacity Connect is B2B/B2G training infrastructure for government and private organizations—built around Admin, Trainer, and Trainee roles.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {SOLUTIONS.map((item) => (
            <div
              key={item.title}
              className="space-y-3 p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-accent/30 transition-colors"
            >
              <h3 className="font-display text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Features Showcase (Card Carousel) */}
      <section id="features" className="relative page max-w-6xl py-24 lg:py-32 px-4 overflow-hidden">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
          <p className="text-[11px] font-mono text-accent uppercase tracking-widest font-semibold">
            Platform Capabilities
          </p>
          <h2 className="font-display text-display-md sm:text-display-lg text-foreground tracking-tight">
            Everything you need for capacity building programs
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            From onboarding new employees to continuously developing existing teams, manage structured training, assessments, competencies, and certification in one platform.
          </p>
        </div>

        <CardCarousel items={FEATURE_CARDS} />
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
                className="space-y-4 text-center sm:text-left p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-accent/30 transition-colors"
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
              Ready to build workforce capability?
            </h2>
            <p className="text-white/70 text-xs leading-relaxed">
              Create structured training programs, onboard new employees, develop existing teams, and measure competency across your organization.
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
