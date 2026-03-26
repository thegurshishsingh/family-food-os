import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const WARM_LIGHT = "#f5e6d3";

export const FloatingBlobs: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  const blobs = [
    { cx: 300, cy: 600, r: 200, color: SAGE_LIGHT, speed: 90, ampX: 40, ampY: 30 },
    { cx: 800, cy: 1400, r: 260, color: WARM_LIGHT, speed: 120, ampX: 50, ampY: 40 },
    { cx: 500, cy: 1000, r: 180, color: SAGE_LIGHT, speed: 70, ampX: 35, ampY: 25 },
  ];

  return (
    <AbsoluteFill>
      {blobs.map((b, i) => {
        const x = b.cx + Math.sin(frame / b.speed) * b.ampX;
        const y = b.cy + Math.cos(frame / b.speed + i) * b.ampY;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - b.r,
              top: y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: "50%",
              background: b.color,
              opacity,
              filter: "blur(80px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const RadialOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 60) * 0.05;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 400,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${SAGE_LIGHT} 0%, transparent 70%)`,
          opacity: 0.4,
          transform: `scale(${pulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 50,
          bottom: 500,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${WARM_LIGHT} 0%, transparent 70%)`,
          opacity: 0.35,
          transform: `scale(${1 + Math.sin(frame / 50 + 1) * 0.05})`,
        }}
      />
    </AbsoluteFill>
  );
};
