import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const SAGE_DARK = "#3a6357";

// FIX 4: Real situation cards instead of avatar circles
const SITUATION_CARDS = [
  { emoji: "📅", title: "Wednesday night", subtitle: "Soccer practice at 6pm", from: "left" as const },
  { emoji: "😫", title: "Thursday", subtitle: "Too tired to cook", from: "top" as const },
  { emoji: "🍕", title: "Friday", subtitle: "Kids want takeout... again", from: "right" as const },
];

const TAGS = ["Busy Wednesdays", "Picky eaters", "Takeout nights", "Sports weeks", "High-protein goals"];

export const Scene2Shift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrowY = interpolate(frame, [0, 10], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headlineProgress = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  const subtitleOp = interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="sage" />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 160 }}>
        <div style={{ width: 1000, textAlign: "center" }}>
          {/* Eyebrow */}
          <div style={{ opacity: eyebrowOp, transform: `translateY(${eyebrowY}px)`, marginBottom: 16 }}>
            <span style={{
              fontFamily: dmSans, fontSize: 24, fontWeight: 700,
              letterSpacing: 5, color: "#9b9188", textTransform: "uppercase" as const,
            }}>
              INTRODUCING
            </span>
          </div>

          {/* FIX 9: Headline min 52px */}
          <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 12 }}>
            <span style={{ fontFamily: fraunces, fontSize: 54, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
              Family Food OS{" "}
              <span style={{ color: SAGE, fontStyle: "italic" }}>learns</span>{" "}
              your family.
            </span>
          </div>

          {/* FIX 9: Subtitle min 32px */}
          <div style={{ opacity: subtitleOp, marginBottom: 50 }}>
            <span style={{ fontFamily: dmSans, fontSize: 32, color: "#9b9188", lineHeight: 1.5 }}>
              Not just what to cook — but how your family actually eats.
            </span>
          </div>

          {/* FIX 4: Situation cards instead of avatars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 50, padding: "0 24px" }}>
            {SITUATION_CARDS.map((card, i) => {
              const delay = 32 + i * 8;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
              const op = interpolate(prog, [0, 1], [0, 1]);
              const dirX = card.from === "left" ? -80 : card.from === "right" ? 80 : 0;
              const dirY = card.from === "top" ? -60 : 0;
              const x = interpolate(prog, [0, 1], [dirX, 0]);
              const y = interpolate(prog, [0, 1], [dirY, 0]);
              return (
                <div key={i} style={{
                  opacity: op,
                  transform: `translate(${x}px, ${y}px)`,
                  background: "#fff",
                  borderRadius: 20,
                  padding: "24px 28px",
                  textAlign: "left" as const,
                  flex: 1,
                  border: "2px solid #e5e2dd",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{card.emoji}</div>
                  <div style={{ fontFamily: dmSans, fontSize: 24, fontWeight: 700, color: "#221F1C", marginBottom: 6 }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: dmSans, fontSize: 22, color: "#9b9188", fontWeight: 500 }}>
                    {card.subtitle}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tags — FIX 9: min 28px, spread across full width */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, width: "100%" }}>
              {TAGS.slice(0, 3).map((tag, i) => {
                const delay = 58 + i * 20;
                const prog = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
                const op = interpolate(prog, [0, 1], [0, 1]);
                const y = interpolate(prog, [0, 1], [24, 0]);
                return (
                  <div key={i} style={{
                    opacity: op,
                    transform: `translateY(${y}px)`,
                    background: SAGE_LIGHT,
                    color: SAGE_DARK,
                    fontFamily: dmSans, fontSize: 28, fontWeight: 600,
                    padding: "14px 30px", borderRadius: 50,
                  }}>
                    {tag}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              {TAGS.slice(3).map((tag, i) => {
                const delay = 58 + (i + 3) * 20;
                const prog = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
                const op = interpolate(prog, [0, 1], [0, 1]);
                const y = interpolate(prog, [0, 1], [24, 0]);
                return (
                  <div key={i} style={{
                    opacity: op,
                    transform: `translateY(${y}px)`,
                    background: SAGE_LIGHT,
                    color: SAGE_DARK,
                    fontFamily: dmSans, fontSize: 28, fontWeight: 600,
                    padding: "14px 30px", borderRadius: 50,
                  }}>
                    {tag}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
