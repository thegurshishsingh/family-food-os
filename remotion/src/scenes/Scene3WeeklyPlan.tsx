import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";

const MEALS = [
  { day: "Mon 10", mode: "COOK", modeColor: SAGE, meal: "Lemon chicken bowls", prep: "30 min" },
  { day: "Tue 11", mode: "LEFTOVERS", modeColor: "#CC8E52", meal: "Leftover taco bowls", prep: "5 min" },
  { day: "Wed 12", mode: "TAKEOUT", modeColor: "#d4874d", meal: "Family sushi", prep: "—" },
  { day: "Thu 13", mode: "COOK", modeColor: SAGE, meal: "Sheet pan salmon", prep: "25 min" },
  { day: "Fri 14", mode: "DINE OUT", modeColor: "#c56b6b", meal: "Dinner out", prep: "—" },
  { day: "Sat 15", mode: "COOK", modeColor: SAGE, meal: "Slow cooker chili", prep: "15 min" },
  { day: "Sun 16", mode: "LEFTOVERS", modeColor: "#CC8E52", meal: "Chili nachos", prep: "10 min" },
];

export const Scene3WeeklyPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Label
  const labelOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Card entrance
  const cardProgress = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 160 } });
  const cardOp = interpolate(cardProgress, [0, 1], [0, 1]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.94, 1]);

  // Header
  const headerProgress = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 160 } });
  const headerOp = interpolate(headerProgress, [0, 1], [0, 1]);

  // Reality score
  const scoreProgress = spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 200 } });
  const scoreScale = interpolate(scoreProgress, [0, 1], [0, 1]);

  // Column headers
  const colOp = interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Footer
  const footerStart = 45 + MEALS.length * 18 + 10;
  const footerOp = interpolate(frame, [footerStart, footerStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA
  const ctaStart = footerStart + 20;
  const ctaProgress = spring({ frame: frame - ctaStart, fps, config: { damping: 14, stiffness: 160 } });
  const ctaOp = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F5", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 880, textAlign: "center" }}>
        {/* Label */}
        <div style={{ opacity: labelOp, marginBottom: 30 }}>
          <span style={{
            fontFamily: dmSans, fontSize: 20, fontWeight: 700,
            letterSpacing: 4, color: "#9b9188", textTransform: "uppercase" as const,
          }}>
            YOUR WEEK, PLANNED
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            opacity: cardOp,
            transform: `scale(${cardScale})`,
            background: "#fff",
            borderRadius: 24,
            border: "2px solid #e5e2dd",
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              opacity: headerOp,
              background: SAGE,
              padding: "24px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: dmSans, fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const }}>
                YOUR WEEK
              </div>
              <div style={{ fontFamily: fraunces, fontSize: 30, color: "#fff", fontWeight: 600, marginTop: 4 }}>
                March 10 – 16
              </div>
            </div>
            <div style={{
              transform: `scale(${scoreScale})`,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 50,
              padding: "10px 22px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Reality Score</span>
              <span style={{ fontFamily: fraunces, fontSize: 28, color: "#fff", fontWeight: 700 }}>84</span>
            </div>
          </div>

          {/* Column headers */}
          <div
            style={{
              opacity: colOp,
              display: "grid",
              gridTemplateColumns: "100px 140px 1fr 90px",
              padding: "16px 36px",
              borderBottom: "1px solid #eee",
            }}
          >
            {["DAY", "MODE", "MEAL", "PREP"].map((h) => (
              <span key={h} style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 700,
                color: "#9b9188", letterSpacing: 2, textTransform: "uppercase" as const, textAlign: "left" as const,
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Meal rows */}
          {MEALS.map((m, i) => {
            const delay = 45 + i * 18;
            const rowProgress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
            const rowOp = interpolate(rowProgress, [0, 1], [0, 1]);
            const rowX = interpolate(rowProgress, [0, 1], [-40, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: rowOp,
                  transform: `translateX(${rowX}px)`,
                  display: "grid",
                  gridTemplateColumns: "100px 140px 1fr 90px",
                  padding: "16px 36px",
                  borderBottom: i < MEALS.length - 1 ? "1px solid #f0eeeb" : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: dmSans, fontSize: 20, color: "#555", fontWeight: 500 }}>{m.day}</span>
                <span style={{
                  fontFamily: dmSans, fontSize: 15, fontWeight: 700,
                  color: "#fff",
                  background: m.modeColor,
                  borderRadius: 50,
                  padding: "5px 14px",
                  display: "inline-block",
                  width: "fit-content",
                  letterSpacing: 1,
                }}>
                  {m.mode}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 22, color: "#221F1C", fontWeight: 500 }}>{m.meal}</span>
                <span style={{ fontFamily: dmSans, fontSize: 20, color: "#9b9188", textAlign: "right" as const }}>{m.prep}</span>
              </div>
            );
          })}

          {/* Footer */}
          <div
            style={{
              opacity: footerOp,
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 36px",
              background: SAGE_LIGHT,
              borderTop: "1px solid #ddd",
            }}
          >
            <span style={{ fontFamily: dmSans, fontSize: 19, color: SAGE, fontWeight: 600 }}>
              4 cook · 2 leftovers · 1 out
            </span>
            <span style={{ fontFamily: dmSans, fontSize: 19, color: "#9b9188", fontWeight: 500 }}>
              ~2,400 cal avg
            </span>
          </div>
        </div>

        {/* CTA */}
        <div style={{ opacity: ctaOp, transform: `translateY(${ctaY}px)`, marginTop: 40 }}>
          <span style={{ fontFamily: fraunces, fontSize: 34, color: SAGE, fontStyle: "italic", fontWeight: 500 }}>
            This could be your week.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
