"use client";

/**
 * Copper Shadow — Aura gradient (dark)
 * Base #100e0b sits as a sibling under the blend layers (not on the layer container).
 */
export function CopperShadowAura({ children, className = "" }) {
  return (
    <div
      className={`copper-shadow-aura relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* Base backdrop — blend layers composite against this */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "#100e0b", zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Layer 1 — screen */}
      <div className="copper-shadow-layer-1" aria-hidden="true" />
      {/* Layer 2 — screen */}
      <div className="copper-shadow-layer-2" aria-hidden="true" />
      {/* Layer 3 — soft-light */}
      <div className="copper-shadow-layer-3" aria-hidden="true" />

      {/* Film grain */}
      <div className="copper-shadow-grain" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="copper-shadow-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0.181 0.608 0.061 0 0.075
                      0.181 0.608 0.061 0 0.075
                      0.181 0.608 0.061 0 0.075
                      0     0     0     1 0"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#copper-shadow-grain)" />
        </svg>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
