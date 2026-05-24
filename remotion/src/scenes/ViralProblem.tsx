import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CreamBackground } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

const PROBLEMS = [
  { headline: "Decision fatigue", sub: "“What do you want?” asked 21 times a week." },
  { headline: "Food waste", sub: "Half a bag of spinach. Every Sunday. The trash." },
  { headline: "Forgotten plans", sub: "Tuesday's leftovers go uneaten by Friday." },
  { headline: "The 6pm panic", sub: "Doordash. Again. $42 for cold fries." },
];

export const ViralProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headP = spring({ frame, fps, config: { damping: 16, stiffness: 150 } });

  return (
    <AbsoluteFill>
      <CreamBackground />
      <AbsoluteFill style={{ padding: "100px 70px", justifyContent: "center" }}>
        <div>
          <div style={{
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: inter, fontSize: 26, fontWeight: 700,
            letterSpacing: 5, color: BRAND.deepMoss, textTransform: "uppercase",
            marginBottom: 24,
          }}>
            THE REAL PROBLEM
          </div>
          <div style={{
            opacity: interpolate(headP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headP, [0, 1], [20, 0])}px)`,
            fontFamily: sora, fontWeight: 800, fontSize: 96,
            color: BRAND.charcoal, lineHeight: 1.0, letterSpacing: -3,
            marginBottom: 56,
          }}>
            What actually
            <br />
            <span style={{ color: BRAND.deepMoss }}>breaks dinner.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {PROBLEMS.map((p, i) => {
              const startAt = 18 + i * 12;
              const sp = spring({ frame: frame - startAt, fps, config: { damping: 16, stiffness: 170 } });
              const op = interpolate(sp, [0, 1], [0, 1]);
              const x = interpolate(sp, [0, 1], [-30, 0]);
              return (
                <div key={i} style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "22px 28px",
                  background: BRAND.pureWhite,
                  borderRadius: 22,
                  border: `1px solid ${BRAND.creamWarm}`,
                  boxShadow: "0 14px 36px rgba(31,31,31,0.04)",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: BRAND.softAmber, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: sora, fontSize: 40, fontWeight: 700,
                      color: BRAND.charcoal, letterSpacing: -1,
                    }}>{p.headline}</div>
                    <div style={{
                      fontFamily: inter, fontSize: 24, color: BRAND.warmGray,
                      marginTop: 4,
                    }}>{p.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            opacity: interpolate(frame, [96, 114], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [96, 114], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            marginTop: 48, padding: "20px 28px",
            background: BRAND.deepMoss, borderRadius: 999, display: "inline-flex",
            fontFamily: inter, fontSize: 26, fontWeight: 600, color: BRAND.softCream,
          }}>
            None of that is solved by another recipe.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
