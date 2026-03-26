import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const WARM_LIGHT = "#f5e6d3";

// FIX 1: Large background elements that fill the full 1080x1920 canvas

export const FullFrameBackground: React.FC<{ variant?: "warm" | "sage" | "dark" }> = ({ variant = "warm" }) => {
  const frame = useCurrentFrame();

  if (variant === "dark") {
    return (
      <AbsoluteFill style={{
        background: "linear-gradient(170deg, #1a1a1e 0%, #2a2a30 50%, #1a1a1e 100%)",
      }}>
        <div style={{
          position: "absolute", left: -200, top: -200,
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,124,107,0.15) 0%, transparent 70%)",
          transform: `translate(${Math.sin(frame / 80) * 30}px, ${Math.cos(frame / 90) * 20}px)`,
        }} />
        <div style={{
          position: "absolute", right: -150, bottom: 200,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(204,142,82,0.1) 0%, transparent 70%)",
          transform: `translate(${Math.sin(frame / 70 + 1) * 25}px, ${Math.cos(frame / 60) * 15}px)`,
        }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{
      background: variant === "sage"
        ? "linear-gradient(170deg, #FAF8F5 0%, #f0ebe4 40%, #E2EDE8 100%)"
        : "linear-gradient(170deg, #FAF8F5 0%, #f5f0ea 50%, #ede6dc 100%)",
    }}>
      {/* Large sage orb top-left */}
      <div style={{
        position: "absolute", left: -250, top: -100,
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, ${SAGE_LIGHT} 0%, transparent 65%)`,
        opacity: 0.5,
        transform: `translate(${Math.sin(frame / 100) * 40}px, ${Math.cos(frame / 110) * 30}px)`,
      }} />
      {/* Warm orb bottom-right */}
      <div style={{
        position: "absolute", right: -200, bottom: -50,
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${WARM_LIGHT} 0%, transparent 60%)`,
        opacity: 0.4,
        transform: `translate(${Math.sin(frame / 90 + 2) * 35}px, ${Math.cos(frame / 80) * 25}px)`,
      }} />
      {/* Mid orb */}
      <div style={{
        position: "absolute", left: 200, top: 900,
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${SAGE_LIGHT} 0%, transparent 70%)`,
        opacity: 0.3,
        transform: `translate(${Math.sin(frame / 70 + 1) * 20}px, ${Math.cos(frame / 80 + 1) * 15}px)`,
      }} />
      {/* Geometric accent — floating diamond */}
      <div style={{
        position: "absolute", right: 80, top: 300,
        width: 120, height: 120,
        border: `3px solid ${SAGE}`,
        opacity: 0.12,
        transform: `rotate(${45 + Math.sin(frame / 60) * 10}deg)`,
      }} />
      <div style={{
        position: "absolute", left: 60, bottom: 400,
        width: 80, height: 80,
        border: `2px solid ${SAGE}`,
        borderRadius: "50%",
        opacity: 0.1,
        transform: `scale(${1 + Math.sin(frame / 50) * 0.1})`,
      }} />
    </AbsoluteFill>
  );
};

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
      <div style={{
        position: "absolute", left: -100, top: 200,
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${SAGE_LIGHT} 0%, transparent 70%)`,
        opacity: 0.5, transform: `scale(${pulse})`,
      }} />
      <div style={{
        position: "absolute", right: -100, bottom: 300,
        width: 550, height: 550, borderRadius: "50%",
        background: `radial-gradient(circle, ${WARM_LIGHT} 0%, transparent 70%)`,
        opacity: 0.4, transform: `scale(${1 + Math.sin(frame / 50 + 1) * 0.05})`,
      }} />
    </AbsoluteFill>
  );
};
