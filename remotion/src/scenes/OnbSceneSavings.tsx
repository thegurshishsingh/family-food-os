import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const CHARCOAL = "#221F1C";
const CREAM = "#FAF8F5";
const WARM = "#CC8E52";

const STATS = [
  { value: "2+ hrs", label: "reclaimed every week", sub: "no more 6pm panic", accent: SAGE, icon: "◷" },
  { value: "$60-80", label: "saved on groceries", sub: "less waste, smarter list", accent: WARM, icon: "$" },
  { value: "0", label: "midweek takeout fallbacks", sub: "dinner is already decided", accent: "#c56b6b", icon: "✓" },
];


const useCount = (frame: number, start: number, end: number, from: number, to: number) => {
  const p = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // ease out
  const eased = 1 - Math.pow(1 - p, 3);
  return from + (to - from) * eased;
};

export const OnbSceneSavings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerP = spring({ frame, fps, config: { damping: 16, stiffness: 150 } });
  const headerOp = interpolate(headerP, [0, 1], [0, 1]);
  const headerY = interpolate(headerP, [0, 1], [20, 0]);

  // Counters
  const hours = useCount(frame, 14, 50, 0, 2.4);
  const dollars = useCount(frame, 22, 58, 0, 78);

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="warm" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
        <div style={{ width: "100%", maxWidth: 920 }}>
          {/* Eyebrow */}
          <div style={{
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: dmSans, fontSize: 26, fontWeight: 700,
            letterSpacing: 6, color: SAGE, textTransform: "uppercase",
            textAlign: "center", marginBottom: 28,
          }}>
            WHAT YOUR FAMILY GETS BACK
          </div>

          <div style={{
            opacity: headerOp,
            transform: `translateY(${headerY}px)`,
            fontFamily: fraunces, fontSize: 100, fontWeight: 600,
            color: CHARCOAL, textAlign: "center", lineHeight: 1.0,
            letterSpacing: -3, marginBottom: 64,
          }}>
            Every. Single. <span style={{ color: SAGE, fontStyle: "italic" }}>Week.</span>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {STATS.map((s, i) => {
              const startAt = 14 + i * 14;
              const p = spring({ frame: frame - startAt, fps, config: { damping: 16, stiffness: 170 } });
              const op = interpolate(p, [0, 1], [0, 1]);
              const x = interpolate(p, [0, 1], [40, 0]);

              // Live counter values for first two cards
              let displayValue = s.value;
              if (i === 0) {
                displayValue = `${hours.toFixed(1).replace(".0", "")}+ hrs`;
                if (frame > 50) displayValue = "2+ hrs";
              } else if (i === 1) {
                displayValue = `$${Math.round(dollars)}`;
                if (frame > 58) displayValue = "$60-80";
              }

              return (
                <div key={i} style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  background: CREAM,
                  border: "2px solid #ede6dc",
                  borderRadius: 28,
                  padding: "32px 40px",
                  display: "flex", alignItems: "center", gap: 28,
                  boxShadow: "0 18px 50px rgba(34,31,28,0.08)",
                }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 24,
                    background: `${s.accent}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 52,
                  }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: fraunces, fontSize: 76, fontWeight: 700,
                      color: s.accent, lineHeight: 1.0, letterSpacing: -2,
                    }}>
                      {displayValue}
                    </div>
                    <div style={{
                      fontFamily: dmSans, fontSize: 30, fontWeight: 600,
                      color: CHARCOAL, marginTop: 8,
                    }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontFamily: dmSans, fontSize: 22, color: "#7a7269",
                      marginTop: 4,
                    }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final CTA */}
          <div style={{
            opacity: interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [110, 130], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            textAlign: "center", marginTop: 56,
          }}>
            <div style={{
              fontFamily: fraunces, fontSize: 56, fontWeight: 600,
              color: CHARCOAL, fontStyle: "italic", marginBottom: 24,
            }}>
              Plan smarter. Eat better.
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 16,
              padding: "20px 40px", borderRadius: 999,
              background: SAGE, color: CREAM,
              fontFamily: dmSans, fontSize: 32, fontWeight: 700,
            }}>
              familyfoodos.com
              <span style={{ fontSize: 28 }}>→</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
