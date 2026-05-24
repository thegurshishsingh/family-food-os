import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const CHARCOAL = "#221F1C";
const WARM = "#CC8E52";

export const OnbSceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const eyebrowY = interpolate(frame, [0, 12], [12, 0], { extrapolateRight: "clamp" });

  const lineA = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 140 } });
  const lineB = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 140 } });
  const lineC = spring({ frame: frame - 36, fps, config: { damping: 12, stiffness: 160 } });

  const dotPulse = 1 + Math.sin(frame / 8) * 0.15;

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="warm" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
        <div style={{ width: "100%", textAlign: "left" }}>
          {/* Eyebrow */}
          <div style={{
            opacity: eyebrowOp,
            transform: `translateY(${eyebrowY}px)`,
            display: "flex", alignItems: "center", gap: 14, marginBottom: 48,
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: WARM, transform: `scale(${dotPulse})`,
            }} />
            <span style={{
              fontFamily: dmSans, fontSize: 28, fontWeight: 700,
              letterSpacing: 6, color: SAGE, textTransform: "uppercase",
            }}>
              5 MINUTES TO SET UP
            </span>
          </div>

          {/* Headline */}
          <div style={{
            opacity: interpolate(lineA, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineA, [0, 1], [40, 0])}px)`,
            fontFamily: fraunces, fontSize: 180, fontWeight: 600,
            lineHeight: 0.95, color: CHARCOAL, letterSpacing: -3,
          }}>
            A whole
          </div>
          <div style={{
            opacity: interpolate(lineB, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineB, [0, 1], [40, 0])}px)`,
            fontFamily: fraunces, fontSize: 180, fontWeight: 600,
            lineHeight: 0.95, color: CHARCOAL, letterSpacing: -3,
            marginTop: 8,
          }}>
            week of
          </div>
          <div style={{
            opacity: interpolate(lineC, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineC, [0, 1], [40, 0])}px)`,
            fontFamily: fraunces, fontSize: 180, fontWeight: 600,
            lineHeight: 0.95, color: SAGE, letterSpacing: -3,
            fontStyle: "italic",
            marginTop: 8,
          }}>
            dinner.
          </div>

          {/* Subtle subline */}
          <div style={{
            opacity: interpolate(frame, [50, 64], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: dmSans, fontSize: 40, color: "#5a534b",
            marginTop: 56, lineHeight: 1.3,
          }}>
            Planned for your family. Automatically.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
