"use client";

import React from "react";

/**
 * Blood Aurora - Aura Gradient Background
 *
 * Full-screen constant background with layered CSS blend modes:
 * - Layer 1: Linear gradient (screen, blur: 85px/122px)
 * - Layer 2: Linear gradient (screen, blur: 75px/108px, opacity: 0.9)
 * - Layer 3: Radial gradient (screen, blur: 70px/101px, opacity: 0.9)
 * - Layer 4: Radial gradient (screen, blur: 175px/252px)
 * - Layer 5: Linear gradient (multiply, blur: 80px/115px, opacity: 0.9)
 * - Layer 6: Radial gradient (screen, blur: 138px/198px, opacity: 0.7)
 * - Grain overlay: SVG feTurbulence noise (overlay, opacity: 0.85)
 */
export function AuraBackground({ children, className = "", style = {}, isFixed = true }) {
  if (isFixed) {
    return (
      <div
        className={`aura-fixed-canvas ${className}`}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          isolation: "isolate",
          ...style,
        }}
        aria-hidden="true"
      >
        {/* Base Canvas Layer (#100e0b) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#100e0b",
            zIndex: -1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Layer 1 - screen */}
        <div className="aura-layer-1" aria-hidden="true" />

        {/* Layer 2 - screen */}
        <div className="aura-layer-2" aria-hidden="true" />

        {/* Layer 3 - screen */}
        <div className="aura-layer-3" aria-hidden="true" />

        {/* Layer 4 - screen */}
        <div className="aura-layer-4" aria-hidden="true" />

        {/* Layer 5 - multiply */}
        <div className="aura-layer-5" aria-hidden="true" />

        {/* Layer 6 - screen */}
        <div className="aura-layer-6" aria-hidden="true" />

        {/* Film-grain overlay */}
        <div className="aura-grain" aria-hidden="true">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="blood-aurora-grain">
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
            <rect width="100%" height="100%" filter="url(#blood-aurora-grain)" />
          </svg>
        </div>
      </div>
    );
  }

  // Relative wrapper mode
  return (
    <div
      className={`aura-bg relative overflow-hidden min-h-screen ${className}`}
      style={{
        isolation: "isolate",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#100e0b",
          zIndex: -1,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      <div className="aura-layer-1" aria-hidden="true" />
      <div className="aura-layer-2" aria-hidden="true" />
      <div className="aura-layer-3" aria-hidden="true" />
      <div className="aura-layer-4" aria-hidden="true" />
      <div className="aura-layer-5" aria-hidden="true" />
      <div className="aura-layer-6" aria-hidden="true" />

      <div className="aura-grain" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="blood-aurora-grain-rel">
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
          <rect width="100%" height="100%" filter="url(#blood-aurora-grain-rel)" />
        </svg>
      </div>

      {children && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
}

export default AuraBackground;
