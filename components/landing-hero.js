"use client";

import Link from "next/link";
import HeroGeometric from "@/components/hero-geometric";

export function LandingHero() {
  return (
    <HeroGeometric
      title1="Build capacity,"
      title2="measure growth"
      description="A state-of-the-art training management platform to deliver structured educational paths, map coordinator competencies, and track measurable outcomes."
      color1="#EA580C"
      color2="#fdfdfdff"
    >
      <div className="flex flex-wrap gap-4 justify-center pt-2">
        <Link
          href="/sign-up"
          className="btn-primary py-2.5 px-6 shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
        >
          Get Started
        </Link>
        <Link
          href="/sign-in"
          className="btn-secondary py-2.5 px-6 border border-border bg-card/60 backdrop-blur-sm"
        >
          Sign In
        </Link>
      </div>
    </HeroGeometric>
  );
}
