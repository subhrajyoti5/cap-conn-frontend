"use client";

import Link from "next/link";
import HeroGeometric from "@/components/hero-geometric";

export function LandingHero() {
  return (
    <HeroGeometric
      title1="Learn smarter,"
      title2="grow faster"
      description="Employee training and competency management for government and private organizations. Train new joiners, upskill employees, track competencies, and build structured learning programs—all in one platform."
      color1="#EA580C"
      color2="#fdfdfd"
      opacity={0.85}
    >
      <div className="flex flex-wrap gap-4 justify-center pt-2">
        <Link
          href="/sign-up"
          className="btn-primary py-2.5 px-6 shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
        >
          Get Started
        </Link>
        <Link
          href="/#how-it-works"
          className="btn-secondary py-2.5 px-6 border border-border bg-card/60 backdrop-blur-sm"
        >
          See How It Works
        </Link>
      </div>
    </HeroGeometric>
  );
}
