import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { RadialOrbs } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";

export const Scene5Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo
  const logoProgress = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 160 } });
  const logoOp = interpolate(logoProgress, [0, 1], [0, 1]);
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);
  const logoPulse = 1 + Math.sin(frame / 30) * 0.04;

  // Headline
  const headlineProgress = spring({ frame: frame - 25, fps, config: { damping: 10, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [30, 0]);

  // Tagline
  const taglineOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA button
  const ctaProgress = spring({ frame: frame - 60, fps, config: { damping: 14, stiffness: 160 } });
  const ctaOp = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaScale = interpolate(ctaProgress, [0, 1], [0.9, 1]);
  const ctaPulse = 1 + Math.sin(frame / 20) * 0.02;

  // Social proof
  const socialOp = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Final fade
  const fadeOut = interpolate(frame, [120, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F5" }}>
      <RadialOrbs />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut }}>
        <div style={{ textAlign: "center", width: 850 }}>
          {/* Logo */}
          <div style={{
            opacity: logoOp,
            transform: `scale(${logoScale * logoPulse})`,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            marginBottom: 50,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, background: SAGE,
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
            }}>
              {/* Chef hat SVG */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" y1="17" x2="18" y2="17" />
              </svg>
            </div>
            <span style={{ fontFamily: fraunces, fontSize: 32, fontWeight: 600, color: "#221F1C" }}>
              Family Food OS
            </span>
          </div>

          {/* Headline */}
          <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 24 }}>
            <span style={{ fontFamily: fraunces, fontSize: 72, fontWeight: 600, color: "#221F1C", lineHeight: 1.15 }}>
              Plan your real week<br />
              <span style={{ color: SAGE, fontStyle: "italic" }}>of food.</span>
            </span>
          </div>

          {/* Tagline */}
          <div style={{ opacity: taglineOp, marginBottom: 40 }}>
            <span style={{ fontFamily: dmSans, fontSize: 28, color: "#9b9188" }}>
              5 minutes to set up. Smarter every week after that.
            </span>
          </div>

          {/* CTA */}
          <div style={{ opacity: ctaOp, transform: `scale(${ctaScale * ctaPulse})`, marginBottom: 30 }}>
            <div style={{
              display: "inline-flex",
              background: SAGE,
              borderRadius: 60,
              padding: "22px 52px",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 26, color: "#fff", fontWeight: 600 }}>
                Start planning for free →
              </span>
            </div>
          </div>

          {/* Social proof */}
          <div style={{ opacity: socialOp }}>
            <span style={{ fontFamily: dmSans, fontSize: 22, color: "#b5afa8" }}>
              Joined by 200+ families in early access · No credit card required
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
