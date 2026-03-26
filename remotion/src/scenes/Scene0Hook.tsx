import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

const { fontFamily: dmSans } = loadDMSans();

export const Scene0Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bubbleProgress = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 160 } });
  const bubbleOpacity = interpolate(bubbleProgress, [0, 1], [0, 1]);
  const bubbleY = interpolate(bubbleProgress, [0, 1], [30, 0]);

  // Typing dots that pulse
  const dot1 = Math.sin(frame / 3) > 0 ? 0.9 : 0.3;
  const dot2 = Math.sin(frame / 3 + 1) > 0 ? 0.9 : 0.3;
  const dot3 = Math.sin(frame / 3 + 2) > 0 ? 0.9 : 0.3;

  const typingOpacity = interpolate(frame, [15, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a1e", justifyContent: "center", alignItems: "center" }}>
      {/* Phone screen simulation */}
      <div style={{ width: 700, padding: "0 60px" }}>
        {/* Incoming message bubble */}
        <div
          style={{
            opacity: bubbleOpacity,
            transform: `translateY(${bubbleY}px)`,
            background: "#2a2a2e",
            borderRadius: 24,
            borderBottomLeftRadius: 6,
            padding: "24px 32px",
            maxWidth: 520,
            marginBottom: 24,
          }}
        >
          <span style={{ fontFamily: dmSans, fontSize: 38, color: "#ffffff", lineHeight: 1.4 }}>
            what's for dinner tonight? 🍽️
          </span>
        </div>

        {/* Typing indicator */}
        <div
          style={{
            opacity: typingOpacity,
            display: "flex",
            gap: 8,
            paddingLeft: 16,
            alignItems: "center",
          }}
        >
          {[dot1, dot2, dot3].map((op, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#555",
                opacity: op,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
