import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, Img } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const RECIPES = [
  { img: "images/pasta.png", name: "Pasta Primavera" },
  { img: "images/salad.png", name: "Kale Caesar" },
  { img: "images/chicken.png", name: "Lemon Chicken" },
  { img: "images/grain-bowl.png", name: "Grain Bowl" },
  { img: "images/curry.png", name: "Thai Curry" },
  { img: "images/salmon.png", name: "Salmon Fillet" },
];

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // FIX 9: Headline in upper third, minimum 52px
  const labelOp = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineProgress = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  // FIX 10: Faster grid build — tighter stagger
  const gridStart = 15;

  // FIX 3: X covers entire grid, appears at frame 50
  const xStart = 48;
  const xProgress = spring({ frame: frame - xStart, fps, config: { damping: 10, stiffness: 200 } });
  const xScale = interpolate(xProgress, [0, 1], [0, 1]);

  // FIX 3: Shake after X — starts at frame 55, 3 cycles of 3px wiggle
  const shakeStart = 55;
  const shakeEnd = shakeStart + 15; // half second
  const isShaking = frame >= shakeStart && frame < shakeEnd;
  const shakeX = isShaking ? Math.sin((frame - shakeStart) * 2.5) * 5 : 0;

  // Caption after shake
  const captionOp = interpolate(frame, [shakeEnd, shakeEnd + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionY = interpolate(frame, [shakeEnd, shakeEnd + 10], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Grid dimensions for X sizing
  const gridWidth = 960; // full width with margins
  const cardGap = 16;

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="warm" />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 180 }}>
        <div style={{ width: 1032, textAlign: "center" }}>
          {/* FIX 9: Label */}
          <div style={{ opacity: labelOp, marginBottom: 20 }}>
            <span style={{
              fontFamily: dmSans, fontSize: 24, fontWeight: 700,
              letterSpacing: 5, color: "#9b9188", textTransform: "uppercase" as const,
            }}>
              THE PROBLEM
            </span>
          </div>

          {/* FIX 9: Headline — min 52px */}
          <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 50 }}>
            <span style={{ fontFamily: fraunces, fontSize: 56, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
              Most meal planners give you recipes.
            </span>
          </div>

          {/* Recipe grid + X overlay */}
          <div style={{ position: "relative", display: "inline-block", transform: `translateX(${shakeX}px)` }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: cardGap,
              width: gridWidth,
            }}>
              {RECIPES.map((r, i) => {
                const delay = gridStart + i * 4;
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
                      padding: "18px 16px 22px",
                      textAlign: "center" as const,
                    }}
                  >
                    <Img
                      src={staticFile(r.img)}
                      style={{ width: 90, height: 90, objectFit: "contain", marginBottom: 10 }}
                    />
                    <div style={{ fontFamily: dmSans, fontSize: 22, color: "#555", fontWeight: 500 }}>{r.name}</div>
                  </div>
                );
              })}
            </div>

            {/* FIX 3: X covers ENTIRE grid */}
            <div
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: `translate(-50%, -50%) scale(${xScale})`,
                opacity: xScale > 0.01 ? 1 : 0,
              }}
            >
              <svg width={gridWidth} height={gridWidth * 0.75} viewBox={`0 0 ${gridWidth} ${gridWidth * 0.75}`}>
                <circle
                  cx={gridWidth / 2} cy={gridWidth * 0.375}
                  r={Math.min(gridWidth, gridWidth * 0.75) / 2 - 10}
                  stroke="#E03B3B" strokeWidth="14" fill="none" opacity="0.9"
                />
                <line x1="60" y1="60" x2={gridWidth - 60} y2={gridWidth * 0.75 - 60}
                  stroke="#E03B3B" strokeWidth="14" strokeLinecap="round" />
                <line x1={gridWidth - 60} y1="60" x2="60" y2={gridWidth * 0.75 - 60}
                  stroke="#E03B3B" strokeWidth="14" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Caption — FIX 9: min 24px */}
          <div style={{ opacity: captionOp, transform: `translateY(${captionY}px)`, marginTop: 40 }}>
            <span style={{ fontFamily: dmSans, fontSize: 32, color: "#9b9188", fontStyle: "italic" }}>
              Same 6 recipes. Different week. Every time.
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
