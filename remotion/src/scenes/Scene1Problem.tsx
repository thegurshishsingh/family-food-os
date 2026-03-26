import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const RECIPES = [
  { emoji: "🍝", name: "Pasta Primavera" },
  { emoji: "🥗", name: "Kale Caesar" },
  { emoji: "🍋", name: "Lemon Chicken" },
  { emoji: "🥣", name: "Grain Bowl" },
  { emoji: "🍛", name: "Thai Curry" },
  { emoji: "🐟", name: "Salmon Fillet" },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Label
  const labelOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Headline
  const headlineProgress = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  // Grid appears
  const gridStart = 30;

  // Red X stamp
  const xStart = 75;
  const xProgress = spring({ frame: frame - xStart, fps, config: { damping: 10, stiffness: 200 } });
  const xScale = interpolate(xProgress, [0, 1], [0, 1]);

  // Caption
  const captionOp = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionY = interpolate(frame, [90, 105], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5f3f0", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 850, textAlign: "center" }}>
        {/* Label */}
        <div style={{ opacity: labelOp, marginBottom: 24 }}>
          <span style={{
            fontFamily: dmSans, fontSize: 22, fontWeight: 700,
            letterSpacing: 4, color: "#9b9188", textTransform: "uppercase" as const,
          }}>
            THE PROBLEM
          </span>
        </div>

        {/* Headline */}
        <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 50 }}>
          <span style={{ fontFamily: fraunces, fontSize: 64, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
            Most meal planners give you recipes.
          </span>
        </div>

        {/* Recipe grid */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            {RECIPES.map((r, i) => {
              const delay = gridStart + i * 6;
              const cardProgress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
              const cardOp = interpolate(cardProgress, [0, 1], [0, 1]);
              const cardScale = interpolate(cardProgress, [0, 1], [0.94, 1]);
              return (
                <div
                  key={i}
                  style={{
                    opacity: cardOp,
                    transform: `scale(${cardScale})`,
                    background: "#fff",
                    border: "2px solid #e5e2dd",
                    borderRadius: 20,
                    padding: "28px 20px",
                    textAlign: "center" as const,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{r.emoji}</div>
                  <div style={{ fontFamily: dmSans, fontSize: 22, color: "#555", fontWeight: 500 }}>{r.name}</div>
                </div>
              );
            })}
          </div>

          {/* Red X stamp */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${xScale})`,
              opacity: xScale > 0.01 ? 1 : 0,
            }}
          >
            <svg width="320" height="320" viewBox="0 0 320 320">
              <circle cx="160" cy="160" r="145" stroke="#E03B3B" strokeWidth="12" fill="none" opacity="0.9" />
              <line x1="80" y1="80" x2="240" y2="240" stroke="#E03B3B" strokeWidth="12" strokeLinecap="round" />
              <line x1="240" y1="80" x2="80" y2="240" stroke="#E03B3B" strokeWidth="12" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Caption */}
        <div style={{ opacity: captionOp, transform: `translateY(${captionY}px)`, marginTop: 40 }}>
          <span style={{ fontFamily: dmSans, fontSize: 30, color: "#9b9188", fontStyle: "italic" }}>
            Same 6 recipes. Different week. Every time.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
