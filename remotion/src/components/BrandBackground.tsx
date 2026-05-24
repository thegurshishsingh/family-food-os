import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

// Brand-locked backgrounds: Deep Moss / Soft Cream / Muted Sage / Soft Amber

export const CreamBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BRAND.softCream }}>
      <div style={{
        position: "absolute", left: -260, top: -120,
        width: 820, height: 820, borderRadius: "50%",
        background: `radial-gradient(circle, ${BRAND.sageTint} 0%, transparent 65%)`,
        opacity: 0.7,
        transform: `translate(${Math.sin(frame / 110) * 30}px, ${Math.cos(frame / 120) * 22}px)`,
      }} />
      <div style={{
        position: "absolute", right: -200, bottom: -100,
        width: 720, height: 720, borderRadius: "50%",
        background: `radial-gradient(circle, ${BRAND.amberSoft} 0%, transparent 60%)`,
        opacity: 0.35,
        transform: `translate(${Math.sin(frame / 95 + 2) * 28}px, ${Math.cos(frame / 85) * 20}px)`,
      }} />
      <div style={{
        position: "absolute", left: 220, top: 950,
        width: 520, height: 520, borderRadius: "50%",
        background: `radial-gradient(circle, ${BRAND.sageTint} 0%, transparent 70%)`,
        opacity: 0.4,
        transform: `translate(${Math.sin(frame / 75 + 1) * 18}px, ${Math.cos(frame / 80) * 14}px)`,
      }} />
    </AbsoluteFill>
  );
};

export const MossBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(165deg, ${BRAND.mossDeeper} 0%, ${BRAND.deepMoss} 50%, ${BRAND.mossDeeper} 100%)`,
    }}>
      <div style={{
        position: "absolute", left: -200, top: -150,
        width: 760, height: 760, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(143,175,154,0.22) 0%, transparent 70%)`,
        transform: `translate(${Math.sin(frame / 90) * 26}px, ${Math.cos(frame / 100) * 18}px)`,
      }} />
      <div style={{
        position: "absolute", right: -180, bottom: 200,
        width: 640, height: 640, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(230,168,92,0.16) 0%, transparent 70%)`,
        transform: `translate(${Math.sin(frame / 75 + 1) * 22}px, ${Math.cos(frame / 65) * 14}px)`,
      }} />
      {/* subtle grid texture lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        opacity: 0.6,
      }} />
    </AbsoluteFill>
  );
};

// Brand logo mark — stylized F monogram used in the guide
export const BrandMark: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = BRAND.softCream }) => {
  const stroke = Math.max(4, size * 0.12);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer rounded F shape inspired by the brand mark */}
      <path
        d={`M 28 18 L 72 18 Q 80 18 80 26 L 80 34 Q 80 42 72 42 L 42 42 L 42 52 L 64 52 Q 72 52 72 60 L 72 68 Q 72 76 64 76 L 42 76 L 42 86`}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
