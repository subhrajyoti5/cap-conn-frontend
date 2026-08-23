import Link from "next/link";
import { AuraBackground } from "@/components/aura-background";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#100e0b] text-slate-100 relative selection:bg-accent/30 selection:text-white">
      <AuraBackground isFixed={true} />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-[#100e0b]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-6 sm:px-8 lg:px-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-button bg-accent flex items-center justify-center group-hover:scale-105 transition-transform duration-fast">
                <span className="text-white font-display text-base font-bold">C</span>
              </span>
              <span className="font-display text-lg text-white group-hover:text-accent-300 transition-colors duration-fast">
                Capacity Connect
              </span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link href="/#features" className="btn-tertiary text-slate-300 hover:text-white hidden sm:inline-flex">
                Features
              </Link>
              <Link href="/#how-it-works" className="btn-tertiary text-slate-300 hover:text-white hidden sm:inline-flex">
                How It Works
              </Link>
              <Link href="/sign-in" className="btn-tertiary text-slate-300 hover:text-white hidden md:inline-flex">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content with Horizontal Margins */}
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {children}
        </main>

        {/* Sticky Bottom Footer */}
        <footer className="mt-auto border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-accent flex items-center justify-center">
                <span className="text-white font-display text-[10px] font-bold">C</span>
              </span>
              <span className="text-sm text-slate-300">Capacity Connect</span>
            </div>
            <p className="text-xs text-slate-400">
              Ministry of Earth Sciences / India Meteorological Department
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}