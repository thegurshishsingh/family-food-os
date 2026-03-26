import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: dmSans } = loadDMSans();

export const Scene0Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubbleProgress = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 160 } });
  const bubbleOpacity = interpolate(bubbleProgress, [0, 1], [0, 1]);
  const bubbleY = interpolate(bubbleProgress, [0, 1], [30, 0]);

  const dot1 = Math.sin(frame / 3) > 0 ? 0.9 : 0.3;
  const dot2 = Math.sin(frame / 3 + 1) > 0 ? 0.9 : 0.3;
  const dot3 = Math.sin(frame / 3 + 2) > 0 ? 0.9 : 0.3;

  const typingOpacity = interpolate(frame, [15, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="dark" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* FIX 1: Full-width message area */}
        <div style={{ width: 900, padding: "0 60px" }}>
          <div
            style={{
              opacity: bubbleOpacity,
              transform: `translateY(${bubbleY}px)`,
              background: "#2a2a2e",
              borderRadius: 28,
              borderBottomLeftRadius: 6,
              padding: "32px 40px",
              maxWidth: 720,
              marginBottom: 28,
            }}
          >
            <span style={{ fontFamily: dmSans, fontSize: 44, color: "#ffffff", lineHeight: 1.4 }}>
              what's for dinner tonight? 🍽️
            </span>
          </div>

          <div
            style={{
              opacity: typingOpacity,
              display: "flex",
              gap: 10,
              paddingLeft: 20,
              alignItems: "center",
            }}
          >
            {[dot1, dot2, dot3].map((op, i) => (
              <div
                key={i}
                style={{
                  width: 16, height: 16, borderRadius: "50%",
                  backgroundColor: "#555", opacity: op,
                }}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
