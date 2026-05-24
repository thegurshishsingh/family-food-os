import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CreamBackground } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

const STEPS = [
  "Coordinating your week",
  "Balancing cook · leftovers · takeout",
  "Optimizing the grocery list",
  "Eliminating food waste",
];

export const ViralGeneration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headP = spring({ frame, fps, config: { damping: 16, stiffness: 160 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.08;
  const rot = (frame / 50) * 360;

  const particles = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2 + frame / 70;
    const radius = 220 + Math.sin(frame / 25 + i) * 28;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 6 + (i % 3) * 5,
      color: i % 2 === 0 ? BRAND.deepMoss : BRAND.softAmber,
      opacity: 0.35 + Math.sin(frame / 18 + i) * 0.3,
    };
  });

  return (
    <AbsoluteFill>
      <CreamBackground />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <div style={{
          opacity: interpolate(headP, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headP, [0, 1], [20, 0])}px)`,
          fontFamily: sora, fontWeight: 700, fontSize: 78,
          color: BRAND.charcoal, textAlign: "center", marginBottom: 48,
          letterSpacing: -2,
        }}>
          Coordinating your week<span style={{ color: BRAND.deepMoss }}>...</span>
        </div>

        <div style={{ position: "relative", width: 500, height: 500, marginBottom: 56 }}>
          {particles.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              left: 250 + p.x - p.size / 2,
              top: 250 + p.y - p.size / 2,
              width: p.size, height: p.size,
              borderRadius: "50%", background: p.color,
              opacity: p.opacity, filter: "blur(1.5px)",
            }} />
          ))}
          <div style={{
            position: "absolute", left: 50, top: 50,
            width: 400, height: 400, borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND.sageTint} 0%, transparent 70%)`,
            transform: `scale(${pulse})`,
          }} />
          <div style={{
            position: "absolute", left: 150, top: 150,
            width: 200, height: 200, borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND.deepMoss}, ${BRAND.softAmber})`,
            transform: `scale(${pulse}) rotate(${rot}deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: sora, fontWeight: 800, fontSize: 110,
            color: BRAND.softCream,
          }}>
            ✦
          </div>
        </div>

        <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((label, i) => {
            const startAt = 14 + i * 12;
            const p = spring({ frame: frame - startAt, fps, config: { damping: 18, stiffness: 180 } });
            const op = interpolate(p, [0, 1], [0, 1]);
            const x = interpolate(p, [0, 1], [-20, 0]);
            const checkP = spring({ frame: frame - (startAt + 6), fps, config: { damping: 10, stiffness: 220 } });
            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                display: "flex", alignItems: "center", gap: 18,
                padding: "16px 22px",
                background: BRAND.pureWhite,
                borderRadius: 16,
                border: `1px solid ${BRAND.creamWarm}`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: checkP > 0.1 ? BRAND.deepMoss : BRAND.creamWarm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: BRAND.softCream, fontSize: 20, fontWeight: 700,
                  transform: `scale(${0.7 + checkP * 0.3})`,
                }}>
                  {checkP > 0.1 ? "✓" : ""}
                </div>
                <span style={{
                  fontFamily: inter, fontSize: 28, fontWeight: 600,
                  color: BRAND.charcoal,
                }}>{label}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
