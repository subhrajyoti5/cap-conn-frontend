"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/logo";

export function MarketingNavbar() {
  const pathname = usePathname();
  const [showAuthCtas, setShowAuthCtas] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") {
      setShowAuthCtas(true);
      return undefined;
    }

    const hero = document.getElementById("hero");
    if (!hero) {
      setShowAuthCtas(true);
      return undefined;
    }

    const sync = () => {
      const { bottom } = hero.getBoundingClientRect();
      setShowAuthCtas(bottom <= 64);
    };

    sync();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowAuthCtas(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-64px 0px 0px 0px",
      }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header className="glass-nav fixed top-0 inset-x-0 z-40 h-14">
      <div className="glass-nav-blur" aria-hidden="true" />
      <div className="glass-nav-content flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Capacity Connect Home">
          <Logo className="w-8 h-8 text-accent drop-shadow-sm" />
          <span className="font-semibold text-lg text-slate-900 tracking-tight hidden sm:inline drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
            Capacity Connect
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          <Link
            href="/#features"
            className="btn-tertiary text-sm hidden sm:inline-flex !text-slate-800 hover:!text-slate-950 hover:!bg-white/50"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="btn-tertiary text-sm hidden sm:inline-flex !text-slate-800 hover:!text-slate-950 hover:!bg-white/50"
          >
            How It Works
          </Link>

          <AnimatePresence initial={false}>
            {showAuthCtas && (
              <motion.div
                key="auth-ctas"
                className="flex items-center gap-1 sm:gap-2 overflow-hidden"
                initial={{ opacity: 0, x: 16, width: 0 }}
                animate={{ opacity: 1, x: 0, width: "auto" }}
                exit={{ opacity: 0, x: 16, width: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/sign-in"
                  className="btn-tertiary text-sm hidden md:inline-flex whitespace-nowrap !text-slate-800 hover:!text-slate-950 hover:!bg-white/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="btn-primary text-sm py-1.5 px-4 shadow-md whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Get Started</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}
