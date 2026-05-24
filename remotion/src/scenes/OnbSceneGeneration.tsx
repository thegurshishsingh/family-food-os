import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const CHARCOAL = "#221F1C";
const CREAM = "#FAF8F5";
const WARM = "#CC8E52";

const STEPS = [
  "Reading your family preferences",
  "Balancing cook · leftovers · takeout",
  "Optimizing your grocery list",
  "Saving you 2+ hours this week",
];

export const OnbSceneGeneration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  // Central sparkle/orb pulse
  const pulse = 1 + Math.sin(frame / 6) * 0.08;
  const rot = (frame / 60) * 360;

  // Floating particles
  const particles = Array.from({ length: 14 }).map((_, i) => {
    const angle = (i / 14) * Math.PI * 2 + frame / 80;
    const radius = 240 + Math.sin(frame / 30 + i) * 30;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 8 + (i % 3) * 6,
      color: i % 2 === 0 ? SAGE : WARM,
      opacity: 0.4 + Math.sin(frame / 20 + i) * 0.3,
    };
  });

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="warm" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <div style={{
          opacity: headerOp,
          fontFamily: fraunces, fontSize: 88, fontWeight: 600,
          color: CHARCOAL, textAlign: "center", marginBottom: 60,
          letterSpacing: -2,
        }}>
          Crafting your week<span style={{ color: SAGE }}>...</span>
        </div>

        {/* Central orb with particles */}
        <div style={{ position: "relative", width: 520, height: 520, marginBottom: 60 }}>
          {particles.map((p, i) => (
            <div key={i} style={{
              position: "absolute",
              left: 260 + p.x - p.size / 2,
              top: 260 + p.y - p.size / 2,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: p.opacity,
              filter: "blur(2px)",
            }} />
          ))}
          <div style={{
            position: "absolute", left: 60, top: 60,
            width: 400, height: 400, borderRadius: "50%",
            background: `radial-gradient(circle, ${SAGE_LIGHT} 0%, transparent 70%)`,
            transform: `scale(${pulse})`,
          }} />
          <div style={{
            position: "absolute", left: 160, top: 160,
            width: 200, height: 200, borderRadius: "50%",
            background: `linear-gradient(135deg, ${SAGE}, ${WARM})`,
            transform: `scale(${pulse}) rotate(${rot}deg)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 110, color: "#FAF8F5", fontFamily: fraunces, fontWeight: 700,
          }}>
            ✦
          </div>

        </div>

        {/* Progress checklist */}
        <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 18 }}>
          {STEPS.map((label, i) => {
            const startAt = 20 + i * 16;
            const p = spring({ frame: frame - startAt, fps, config: { damping: 18, stiffness: 180 } });
            const op = interpolate(p, [0, 1], [0, 1]);
            const x = interpolate(p, [0, 1], [-20, 0]);
            const checkP = spring({ frame: frame - (startAt + 8), fps, config: { damping: 10, stiffness: 220 } });

            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                display: "flex", alignItems: "center", gap: 18,
                padding: "18px 24px",
                background: CREAM,
                borderRadius: 18,
                border: "2px solid #ede6dc",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: checkP > 0.1 ? SAGE : "#e6dfd5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 22, fontWeight: 700,
                  transform: `scale(${0.7 + checkP * 0.3})`,
                }}>
                  {checkP > 0.1 ? "✓" : ""}
                </div>
                <span style={{
                  fontFamily: dmSans, fontSize: 30, fontWeight: 600,
                  color: CHARCOAL,
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
