import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FloatingBlobs } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const SAGE_DARK = "#3a6357";

const TAGS = ["Busy Wednesdays", "Picky eaters", "Takeout nights", "Sports weeks", "High-protein goals"];

const AVATARS = [
  { label: "Mom", color: "#CC8E52", from: "left" },
  { label: "Picky Eater", color: SAGE, from: "top" },
  { label: "Dad", color: "#8B6E5A", from: "right" },
];

export const Scene2Shift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrowY = interpolate(frame, [0, 15], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headlineProgress = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  const subtitleOp = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F5" }}>
      <FloatingBlobs opacity={0.2} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 850, textAlign: "center" }}>
          {/* Eyebrow */}
          <div style={{ opacity: eyebrowOp, transform: `translateY(${eyebrowY}px)`, marginBottom: 20 }}>
            <span style={{
              fontFamily: dmSans, fontSize: 20, fontWeight: 700,
              letterSpacing: 5, color: "#9b9188", textTransform: "uppercase" as const,
            }}>
              INTRODUCING
            </span>
          </div>

          {/* Headline */}
          <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 16 }}>
            <span style={{ fontFamily: fraunces, fontSize: 58, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
              Family Food OS{" "}
              <span style={{ color: SAGE, fontStyle: "italic" }}>learns</span>{" "}
              your family.
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ opacity: subtitleOp, marginBottom: 50 }}>
            <span style={{ fontFamily: dmSans, fontSize: 28, color: "#9b9188", lineHeight: 1.5 }}>
              Not just what to cook — but how your family actually eats.
            </span>
          </div>

          {/* Avatars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginBottom: 50 }}>
            {AVATARS.map((av, i) => {
              const delay = 35 + i * 12;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
              const op = interpolate(prog, [0, 1], [0, 1]);
              const dirX = av.from === "left" ? -60 : av.from === "right" ? 60 : 0;
              const dirY = av.from === "top" ? -40 : 0;
              const x = interpolate(prog, [0, 1], [dirX, 0]);
              const y = interpolate(prog, [0, 1], [dirY, 0]);
              return (
                <div key={i} style={{ opacity: op, transform: `translate(${x}px, ${y}px)`, textAlign: "center" as const }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: av.color, margin: "0 auto 12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, color: "#fff",
                  }}>
                    {av.label[0]}
                  </div>
                  <span style={{ fontFamily: dmSans, fontSize: 20, color: "#555", fontWeight: 500 }}>{av.label}</span>
                </div>
              );
            })}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 14 }}>
            {TAGS.map((tag, i) => {
              const delay = 60 + i * 18;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
              const op = interpolate(prog, [0, 1], [0, 1]);
              const y = interpolate(prog, [0, 1], [20, 0]);
              return (
                <div
                  key={i}
                  style={{
                    opacity: op,
                    transform: `translateY(${y}px)`,
                    background: SAGE_LIGHT,
                    color: SAGE_DARK,
                    fontFamily: dmSans,
                    fontSize: 24,
                    fontWeight: 600,
                    padding: "14px 28px",
                    borderRadius: 50,
                  }}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
