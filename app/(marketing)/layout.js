import Link from "next/link";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-40 h-14 border-b border-border-warm bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-button bg-ink flex items-center justify-center">
              <span className="text-white font-display text-base font-bold">C</span>
            </span>
            <span className="font-display text-lg text-ink hidden sm:inline">
              Capacity Connect
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="#features" className="btn-tertiary hidden sm:inline-flex">
              Features
            </Link>
            <Link href="#how-it-works" className="btn-tertiary hidden sm:inline-flex">
              How It Works
            </Link>
            <Link href="/sign-in" className="btn-tertiary hidden md:inline-flex">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Get Started</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}