"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_CAROUSEL_ITEMS = [
  {
    step: "01",
    tag: "Courses",
    title: "Modular Learning Paths",
    desc: "Build structured courses with rich media, cloud resources, and self-paced progress tracking.",
  },
  {
    step: "02",
    tag: "Competencies",
    title: "Verified Trainer Matching",
    desc: "Algorithmically match cohorts with verified domain experts based on mapped skill taxonomies.",
  },
  {
    step: "03",
    tag: "Assessments",
    title: "Instant MCQ Auto-Grading",
    desc: "Server-validated anti-cheat assessments with instant scoring, analytics, and performance reports.",
  },
  {
    step: "04",
    tag: "Certificates",
    title: "Verifiable Digital Credentials",
    desc: "Issue tamper-proof course completion certificates with trackable digital verification.",
  },
  {
    step: "05",
    tag: "Governance",
    title: "Audit Logs & Approvals",
    desc: "Role-based access control, one-click profile approvals, and comprehensive audit trails.",
  },
];

export function CardCarousel({
  className = "",
  items = DEFAULT_CAROUSEL_ITEMS,
  autoplayMs = 3500,
}) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);

  const toPrev = (e) => {
    e?.stopPropagation?.();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toNext = (e) => {
    e?.stopPropagation?.();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const toSlide = (e, index) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  useEffect(() => {
    if (isHovered || items.length <= 1 || autoplayMs <= 0) return undefined;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoplayMs);

    return () => window.clearInterval(id);
  }, [isHovered, items.length, autoplayMs]);

  const slideWidth = 280;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full flex flex-col items-center justify-center relative select-none py-10 ${className}`}
    >
      <div className="relative w-full max-w-4xl mx-auto h-[320px] sm:h-[360px] overflow-hidden">
        {/* Left / right edge fades */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-background via-background/80 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-background via-background/80 to-transparent"
          aria-hidden="true"
        />

        <div
          className="relative h-full mx-auto flex items-center justify-start overflow-visible"
          style={{ width: `${slideWidth}px` }}
        >
          <motion.div
            className="flex w-fit items-center"
            animate={{ x: -activeIndex * slideWidth }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.8 }}
          >
            {items.map((item, i) => {
              const isActive = activeIndex === i;
              const diff = i - activeIndex;

              const targetRotate = isHovered ? diff * 12 : diff * 4;
              const targetScale = isActive ? 1.05 : isHovered ? 0.88 : 0.92;
              const targetY = isHovered ? Math.abs(diff) * 12 : 0;

              return (
                <motion.div
                  key={item.step || i}
                  className="shrink-0 flex flex-col items-center will-change-[transform,scale] px-2"
                  style={{ width: `${slideWidth}px` }}
                  animate={{
                    rotate: targetRotate,
                    scale: targetScale,
                    y: targetY,
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                >
                  <div
                    onClick={(e) => toSlide(e, i)}
                    className={`w-full h-[260px] sm:h-[280px] rounded-2xl p-6 text-left flex flex-col justify-between cursor-pointer transition-all duration-300 border ${
                      isActive
                        ? "bg-gradient-to-b from-card to-card/90 text-foreground border-accent/40 shadow-2xl shadow-accent/10 ring-1 ring-accent/20"
                        : "bg-card/60 backdrop-blur-md text-foreground/70 border-border/70 hover:border-border hover:text-foreground shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {item.tag}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground/60">
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-2 my-auto">
                      <h3 className="font-display text-base font-bold text-foreground leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border/40">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {isActive ? "● Active Feature" : "Click to view"}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-accent" : "bg-muted-foreground/30"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="mt-8 px-2 py-1 flex items-center gap-3 justify-center rounded-full bg-card/80 backdrop-blur-md border border-border shadow-md z-20">
        <button
          type="button"
          onClick={toPrev}
          className="p-1.5 cursor-pointer hover:bg-accent/10 rounded-full transition-colors border-0 bg-transparent text-muted-foreground hover:text-foreground"
          aria-label="Previous card"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="flex justify-center items-center gap-1.5 px-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => toSlide(e, i)}
              aria-label={`Go to card ${i + 1}`}
              className={`rounded-full cursor-pointer h-1.5 transition-all duration-300 border-0 p-0 ${
                activeIndex === i
                  ? "w-6 bg-accent"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={toNext}
          className="p-1.5 cursor-pointer hover:bg-accent/10 rounded-full transition-colors border-0 bg-transparent text-muted-foreground hover:text-foreground"
          aria-label="Next card"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
