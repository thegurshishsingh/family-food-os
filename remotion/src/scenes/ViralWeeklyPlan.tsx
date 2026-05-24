import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CreamBackground } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

const MEALS = [
  { day: "Mon 10", mode: "COOK", modeColor: BRAND.deepMoss, meal: "Lemon chicken bowls", prep: "30 min" },
  { day: "Tue 11", mode: "LEFTOVERS", modeColor: BRAND.softAmber, meal: "Leftover taco bowls", prep: "5 min" },
  { day: "Wed 12", mode: "TAKEOUT", modeColor: "#c47a3a", meal: "Family sushi", prep: "—" },
  { day: "Thu 13", mode: "COOK", modeColor: BRAND.deepMoss, meal: "Sheet pan salmon", prep: "25 min" },
  { day: "Fri 14", mode: "DINE OUT", modeColor: "#a8584a", meal: "Pizza night out", prep: "—" },
  { day: "Sat 15", mode: "COOK", modeColor: BRAND.deepMoss, meal: "Slow cooker chili", prep: "15 min" },
  { day: "Sun 16", mode: "LEFTOVERS", modeColor: BRAND.softAmber, meal: "Chili nachos", prep: "10 min" },
];

export const ViralWeeklyPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const cardP = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 160 } });
  const cardOp = interpolate(cardP, [0, 1], [0, 1]);
  const cardY = interpolate(cardP, [0, 1], [40, 0]);
  const headerP = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 160 } });
  const headerOp = interpolate(headerP, [0, 1], [0, 1]);
  const scoreP = spring({ frame: frame - 22, fps, config: { damping: 10, stiffness: 200 } });

  const rowStart = 32;
  const stagger = 12;
  const lastRowEnd = rowStart + MEALS.length * stagger + 18;
  const footerOp = interpolate(frame, [lastRowEnd, lastRowEnd + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const ctaP = spring({ frame: frame - (lastRowEnd + 18), fps, config: { damping: 14, stiffness: 160 } });

  return (
    <AbsoluteFill>
      <CreamBackground />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <div style={{ width: 1000, textAlign: "center", padding: "0 24px" }}>
          <div style={{
            opacity: labelOp, marginBottom: 22,
            fontFamily: inter, fontSize: 22, fontWeight: 700,
            letterSpacing: 5, color: BRAND.deepMoss, textTransform: "uppercase",
          }}>
            YOUR WEEK, ALREADY DECIDED
          </div>

          <div style={{
            opacity: cardOp,
            transform: `translateY(${cardY}px)`,
            background: BRAND.pureWhite, borderRadius: 32,
            border: `1px solid ${BRAND.creamWarm}`, overflow: "hidden",
            boxShadow: "0 28px 70px rgba(31,31,31,0.08)",
          }}>
            {/* Header */}
            <div style={{
              opacity: headerOp,
              background: BRAND.deepMoss, color: BRAND.softCream,
              padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontFamily: inter, fontSize: 18, fontWeight: 600, opacity: 0.7,
                  letterSpacing: 3, textTransform: "uppercase",
                }}>YOUR WEEK</div>
                <div style={{ fontFamily: sora, fontSize: 38, fontWeight: 700, marginTop: 4, letterSpacing: -1 }}>
                  March 10 — 16
                </div>
              </div>
              <div style={{
                transform: `scale(${scoreP})`,
                background: BRAND.softAmber, color: BRAND.charcoal,
                padding: "12px 20px", borderRadius: 999,
                fontFamily: inter, fontSize: 22, fontWeight: 700,
              }}>
                Reality 84
              </div>
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "120px 130px 1fr 100px",
              padding: "20px 36px 12px",
              fontFamily: inter, fontSize: 18, fontWeight: 700,
              color: BRAND.warmGray, letterSpacing: 2, textTransform: "uppercase",
              textAlign: "left", opacity: interpolate(frame, [24, 34], [0, 1], { extrapolateRight: "clamp" }),
            }}>
              <div>DAY</div><div>MODE</div><div>MEAL</div><div style={{ textAlign: "right" }}>PREP</div>
            </div>

            {/* Rows */}
            <div style={{ padding: "0 24px 24px" }}>
              {MEALS.map((m, i) => {
                const rp = spring({ frame: frame - (rowStart + i * stagger), fps, config: { damping: 18, stiffness: 180 } });
                const op = interpolate(rp, [0, 1], [0, 1]);
                const x = interpolate(rp, [0, 1], [-30, 0]);
                return (
                  <div key={i} style={{
                    opacity: op,
                    transform: `translateX(${x}px)`,
                    display: "grid",
                    gridTemplateColumns: "120px 130px 1fr 100px",
                    alignItems: "center",
                    padding: "16px 12px",
                    borderBottom: i < MEALS.length - 1 ? `1px solid ${BRAND.creamWarm}` : "none",
                    fontFamily: inter,
                    textAlign: "left",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: BRAND.charcoal }}>{m.day}</div>
                    <div>
                      <span style={{
                        background: m.modeColor, color: m.mode === "LEFTOVERS" ? BRAND.charcoal : BRAND.softCream,
                        fontSize: 14, fontWeight: 700, letterSpacing: 1,
                        padding: "6px 12px", borderRadius: 999,
                      }}>
                        {m.mode}
                      </span>
                    </div>
                    <div style={{ fontFamily: sora, fontSize: 24, fontWeight: 600, color: BRAND.charcoal }}>{m.meal}</div>
                    <div style={{ fontSize: 20, color: BRAND.warmGray, textAlign: "right" }}>{m.prep}</div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              opacity: footerOp,
              background: BRAND.sageTint, padding: "18px 36px",
              display: "flex", justifyContent: "space-between",
              fontFamily: inter, fontSize: 20, fontWeight: 600, color: BRAND.deepMoss,
            }}>
              <span>4 cook · 2 leftovers · 1 out</span>
              <span>~2,400 cal avg</span>
            </div>
          </div>

          <div style={{
            opacity: interpolate(ctaP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(ctaP, [0, 1], [20, 0])}px)`,
            fontFamily: sora, fontSize: 50, fontWeight: 700,
            color: BRAND.deepMoss, marginTop: 40, fontStyle: "italic", letterSpacing: -1.5,
          }}>
            One tap. Whole week. Done.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
