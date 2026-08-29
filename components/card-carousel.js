"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_CAROUSEL_ITEMS = [
  {
    step: "01",
    tag: "Learning Paths",
    title: "Structured Learning Paths",
    desc: "Design organization-wide training programs with modular resources and clear progression from new joiner to role-ready employee.",
  },
  {
    step: "02",
    tag: "Trainers",
    title: "Verified Trainer Matching",
    desc: "Match training cohorts with verified instructors based on domain expertise and competency requirements.",
  },
  {
    step: "03",
    tag: "Onboarding",
    title: "Employee Onboarding",
    desc: "Onboard new joiners with structured curricula, assigned training, and measurable readiness checkpoints.",
  },
  {
    step: "04",
    tag: "Competencies",
    title: "Competency Mapping",
    desc: "Map required skills to roles and programs so organizations can track workforce capability with clarity.",
  },
  {
    step: "05",
    tag: "Assessments",
    title: "Assessments & Evaluation",
    desc: "Evaluate employee understanding with structured assessments and transparent scoring for trainers and admins.",
  },
  {
    step: "06",
    tag: "Progress",
    title: "Training Progress",
    desc: "Monitor completion across teams, programs, and individuals so leaders know where capability is building.",
  },
  {
    step: "07",
    tag: "Certificates",
    title: "Certifications",
    desc: "Issue completion credentials that confirm employees have finished required training and competency tracks.",
  },
  {
    step: "08",
    tag: "Verification",
    title: "Skill Verification",
    desc: "Verify that training and skill requirements are complete before employees advance or take on new responsibilities.",
  },
  {
    step: "09",
    tag: "Analytics",
    title: "Organization-wide Training Analytics",
    desc: "See program participation, assessment outcomes, and competency coverage across your organization in one place.",
  },
];

export function CardCarousel({
  className = "",
  items = DEFAULT_CAROUSEL_ITEMS,
  autoplayMs = 3500,
}) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const [slideWidth, setSlideWidth] = useState(280);
  const [isCompact, setIsCompact] = useState(false);

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
    const syncViewport = () => {
      const compact = window.innerWidth < 640;
      setIsCompact(compact);
      setSlideWidth(compact ? Math.min(260, Math.max(220, window.innerWidth - 48)) : 280);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (isHovered || items.length <= 1 || autoplayMs <= 0) return undefined;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoplayMs);

    return () => window.clearInterval(id);
  }, [isHovered, items.length, autoplayMs]);

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

              const rotateFactor = isCompact ? 2 : isHovered ? 12 : 4;
              const targetRotate = (isCompact ? diff * rotateFactor : isHovered ? diff * 12 : diff * 4);
              const targetScale = isActive ? (isCompact ? 1.02 : 1.05) : isHovered && !isCompact ? 0.88 : 0.92;
              const targetY = isHovered && !isCompact ? Math.abs(diff) * 12 : 0;

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
                    className={`w-full h-[260px] sm:h-[280px] rounded-2xl p-6 text-left flex flex-col justify-between cursor-pointer transition-all duration-300 border ${isActive
                        ? "bg-card text-foreground border-accent/50 shadow-xl shadow-accent/10 ring-1 ring-accent/25"
                        : "bg-card text-foreground border-border shadow-md hover:border-accent/25 hover:shadow-lg"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${isActive
                            ? "bg-accent/15 text-accent border-accent/30"
                            : "bg-accent/10 text-accent/90 border-accent/20"
                          }`}
                      >
                        {item.tag}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${isActive ? "text-muted-foreground" : "text-muted-foreground/80"
                          }`}
                      >
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-2 my-auto">
                      <h3
                        className={`font-display text-base font-bold leading-snug ${isActive ? "text-foreground" : "text-foreground/90"
                          }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed line-clamp-3 ${isActive ? "text-foreground/75" : "text-muted-foreground"
                          }`}
                      >
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border">
                      <span
                        className={`text-[10px] font-mono ${isActive ? "text-accent font-semibold" : "text-muted-foreground"
                          }`}
                      >
                        {isActive ? "● Active Feature" : "Click to view"}
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${isActive ? "bg-accent" : "bg-muted-foreground/40"
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
              className={`rounded-full cursor-pointer h-1.5 transition-all duration-300 border-0 p-0 ${activeIndex === i
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
