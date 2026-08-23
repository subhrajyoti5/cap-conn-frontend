import Link from "next/link";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 relative">
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">C</span>
              </span>
              <span className="font-semibold text-lg text-white tracking-tight hidden sm:inline">
                Capacity Connect
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="#features" className="btn-tertiary text-slate-300 hover:text-white hover:bg-slate-800 hidden sm:inline-flex text-sm">
                Features
              </Link>
              <Link href="#how-it-works" className="btn-tertiary text-slate-300 hover:text-white hover:bg-slate-800 hidden sm:inline-flex text-sm">
                How It Works
              </Link>
              <Link href="/sign-in" className="btn-tertiary text-slate-300 hover:text-white hover:bg-slate-800 hidden md:inline-flex text-sm">
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