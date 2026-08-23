import Link from "next/link";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between h-14 px-4 lg:px-8 border-b border-border-warm bg-white">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md gradient-accent-bar flex items-center justify-center">
            <span className="text-white font-display text-sm font-bold">C</span>
          </span>
          <span className="font-display text-lg text-primary hidden sm:inline">
            Capacity Connect
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <a href="#features" className="text-sm text-muted hover:text-ink transition-colors hidden sm:inline">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted hover:text-ink transition-colors hidden sm:inline">
            How It Works
          </a>
          <Link href="/sign-in" className="btn-secondary text-sm">
            Sign In
          </Link>
          <Link href="/sign-up" className="btn-primary text-sm">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
