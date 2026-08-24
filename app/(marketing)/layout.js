import Link from "next/link";
import { Logo } from "@/components/logo";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Capacity Connect Home">
              <Logo className="w-8 h-8 text-accent" />
              <span className="font-semibold text-lg text-foreground tracking-tight hidden sm:inline">
                Capacity Connect
              </span>
            </Link>
            <nav className="flex items-center gap-2" aria-label="Main navigation">
              <Link href="/#features" className="btn-tertiary text-sm hidden sm:inline-flex">
                Features
              </Link>
              <Link href="/#how-it-works" className="btn-tertiary text-sm hidden sm:inline-flex">
                How It Works
              </Link>
              <Link href="/sign-in" className="btn-tertiary text-sm hidden md:inline-flex">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary text-sm py-1.5 px-4">
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}