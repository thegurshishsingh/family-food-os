import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { MossBackground, BrandMark } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

const STATS = [
  { value: "2+ hrs", label: "back every week", sub: "no 6pm panic, no scrolling" },
  { value: "$60-80", label: "saved on groceries", sub: "less waste, smarter list" },
  { value: "0", label: "midweek meltdowns", sub: "the week is already decided" },
];

const useCount = (frame: number, start: number, end: number, from: number, to: number) => {
  const p = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - p, 3);
  return from + (to - from) * eased;
};

export const ViralPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headP = spring({ frame, fps, config: { damping: 16, stiffness: 150 } });
  const hours = useCount(frame, 12, 48, 0, 2.4);
  const dollars = useCount(frame, 20, 56, 0, 78);

  return (
    <AbsoluteFill>
      <MossBackground />
      <AbsoluteFill style={{ padding: "100px 70px", justifyContent: "space-between" }}>
        <div>
          <div style={{
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: inter, fontSize: 24, fontWeight: 700,
            letterSpacing: 5, color: BRAND.mutedSage, textTransform: "uppercase",
            marginBottom: 24,
          }}>
            WHAT FAMILIES GET BACK
          </div>
          <div style={{
            opacity: interpolate(headP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headP, [0, 1], [20, 0])}px)`,
            fontFamily: sora, fontWeight: 800, fontSize: 110,
            color: BRAND.softCream, lineHeight: 0.98, letterSpacing: -4, marginBottom: 56,
          }}>
            Every. Single. <span style={{ color: BRAND.softAmber, fontStyle: "italic" }}>Week.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {STATS.map((s, i) => {
              const startAt = 12 + i * 12;
              const p = spring({ frame: frame - startAt, fps, config: { damping: 16, stiffness: 170 } });
              const op = interpolate(p, [0, 1], [0, 1]);
              const x = interpolate(p, [0, 1], [40, 0]);
              let displayValue = s.value;
              if (i === 0) displayValue = frame > 48 ? "2+ hrs" : `${hours.toFixed(1).replace(".0", "")}+ hrs`;
              else if (i === 1) displayValue = frame > 56 ? "$60-80" : `$${Math.round(dollars)}`;
              return (
                <div key={i} style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  background: "rgba(246,244,239,0.06)",
                  border: `1px solid rgba(246,244,239,0.18)`,
                  borderRadius: 24, padding: "26px 36px",
                  display: "flex", alignItems: "center", gap: 32,
                  backdropFilter: "blur(0)",
                }}>
                  <div style={{
                    fontFamily: sora, fontSize: 72, fontWeight: 800,
                    color: BRAND.softAmber, letterSpacing: -2,
                    minWidth: 220,
                  }}>
                    {displayValue}
                  </div>
                  <div>
                    <div style={{ fontFamily: sora, fontSize: 30, fontWeight: 700, color: BRAND.softCream }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: inter, fontSize: 22, color: BRAND.mutedSage, marginTop: 4 }}>
                      {s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand close */}
        <div style={{
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [80, 100], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <BrandMark size={62} color={BRAND.softCream} />
            <span style={{
              fontFamily: sora, fontSize: 38, fontWeight: 700,
              color: BRAND.softCream, letterSpacing: -1,
            }}>
              Family Food OS
            </span>
          </div>
          <div style={{
            fontFamily: sora, fontSize: 52, fontWeight: 700,
            color: BRAND.softCream, letterSpacing: -1.5, lineHeight: 1.05,
          }}>
            The family operating system.
          </div>
          <div style={{
            fontFamily: sora, fontSize: 52, fontWeight: 700, fontStyle: "italic",
            color: BRAND.softAmber, letterSpacing: -1.5, marginTop: 4,
          }}>
            For real life.
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 14,
            padding: "20px 34px", borderRadius: 999,
            background: BRAND.softAmber, color: BRAND.charcoal,
            fontFamily: inter, fontSize: 28, fontWeight: 700,
            marginTop: 28,
          }}>
            familyfoodos.com
            <span style={{ fontSize: 24 }}>→</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
