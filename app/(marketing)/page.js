import Link from "next/link";

const FEATURES = [
  {
    title: "Structured Courses",
    description: "Trainers create courses with resources, assessments, and clear learning paths. Trainees enroll and progress at their own pace.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Competency Mapping",
    description: "Map trainer expertise to subject competencies. Smart matching finds the right trainer for every course.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "MCQ Assessments",
    description: "Create, publish, and auto-grade multiple-choice assessments. Server-side scoring ensures integrity. Results available instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    title: "Certifications",
    description: "Earn and track certifications as you complete courses and pass assessments. A verifiable record of your growth.",
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
    title: "Sign up as Trainee or Trainer",
    description: "Pick your role. Trainees enroll in courses. Trainers create and manage them.",
  },
  {
    step: "02",
    title: "Complete your profile",
    description: "Add qualifications, work experience, skills, and certifications. Admins approve your account.",
  },
  {
    step: "03",
    title: "Learn, teach, grow",
    description: "Trainers publish courses and assessments. Trainees enroll, attempt, and earn certifications.",
  },
];

const STATS = [
  { value: "MoES/IMD", label: "Backed by" },
  { value: "3", label: "User roles" },
  { value: "100%", label: "Auto-graded" },
  { value: "∞", label: "Courses" },
];

export default async function LandingPage() {
  return (
    <div className="flex-1 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="page py-18 lg:py-24">
          <p className="text-xs font-mono text-accent-400 font-medium tracking-widest uppercase mb-6">
            MoES / IMD — Smart Education
          </p>
          <h1 className="font-display text-display-xl text-white leading-[1.05] mb-6 max-w-3xl">
            Build capacity, <span className="text-accent-400">measure growth</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed">
            A platform for India&apos;s Ministry of Earth Sciences to deliver
            structured courses, map trainer competencies, and track measurable
            outcomes.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up" className="btn-primary-lg shadow-lg shadow-accent/20">
              Get Started
            </Link>
            <Link href="/sign-in" className="btn-secondary-lg bg-white/10 hover:bg-white/20 text-white border-white/20">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-white/[0.03] backdrop-blur-sm">
        <div className="page py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl sm:text-3xl text-white">{s.value}</p>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="page py-18 lg:py-24">
        <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">
          What you can do
        </p>
        <h2 className="font-display text-display-lg text-white mb-12 max-w-lg">
          Everything you need to run a capacity-building program
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, index) => (
            <div
              key={f.title}
              className="card-shell group"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="card p-6 h-full bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-accent/40 transition-colors">
                <div className="w-12 h-12 rounded-card-lg bg-accent/20 text-accent-300 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-normal">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white/[0.02] border-y border-white/10 backdrop-blur-sm">
        <div className="page py-18 lg:py-24">
          <p className="text-xs font-mono text-accent-400 uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="font-display text-display-lg text-white mb-12 max-w-md">
            Three steps to get started
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, index) => (
              <div key={s.step} style={{ animationDelay: `${index * 80}ms` }}>
                <p className="font-mono text-4xl text-accent-300 font-medium mb-3">{s.step}</p>
                <h3 className="font-display text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page py-18 lg:py-24">
        <div className="relative overflow-hidden rounded-card-lg bg-accent/20 border border-accent/30 p-10 sm:p-14 text-center backdrop-blur-md">
          <div className="relative z-10">
            <h2 className="font-display text-display-lg text-white mb-4">
              Ready to build capacity?
            </h2>
            <p className="text-slate-200 max-w-md mx-auto mb-8">
              Join as a trainee to start learning, or as a trainer to share your
              expertise with India&apos;s scientific workforce.
            </p>
            <Link href="/sign-up" className="px-7 py-3 rounded-button bg-accent hover:bg-accent-600 text-white font-medium shadow-lg transition-colors duration-fast inline-block">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}