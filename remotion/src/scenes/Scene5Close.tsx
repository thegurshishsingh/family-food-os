import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";

export const Scene5Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // FIX 7: Flash callback to Scene 0 hook for first 15 frames (0.5s)
  const flashEnd = 15;
  const isFlash = frame < flashEnd;
  const flashOp = isFlash ? interpolate(frame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // Main content starts after flash
  const mainStart = flashEnd;

  // Logo
  const logoProgress = spring({ frame: frame - mainStart - 3, fps, config: { damping: 14, stiffness: 160 } });
  const logoOp = interpolate(logoProgress, [0, 1], [0, 1]);
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);

  // Headline
  const headlineProgress = spring({ frame: frame - mainStart - 15, fps, config: { damping: 10, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [30, 0]);

  // Tagline
  const taglineOp = interpolate(frame, [mainStart + 30, mainStart + 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // CTA button — FIX 7: continuous pulse
  const ctaProgress = spring({ frame: frame - mainStart - 40, fps, config: { damping: 14, stiffness: 160 } });
  const ctaOp = interpolate(ctaProgress, [0, 1], [0, 1]);
  const ctaBaseScale = interpolate(ctaProgress, [0, 1], [0.9, 1]);
  // Continuous pulse: 1.0 → 1.05 → 1.0, 1.5s loop (45 frames)
  const ctaPulse = 1 + Math.sin((frame - mainStart - 40) * (2 * Math.PI / 45)) * 0.05;

  // Social proof
  const socialOp = interpolate(frame, [mainStart + 55, mainStart + 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* FIX 7: Flash of hook scene */}
      {isFlash && (
        <AbsoluteFill style={{
          backgroundColor: "#1a1a1e",
          justifyContent: "center", alignItems: "center",
          opacity: flashOp,
        }}>
          <div style={{ width: 900, padding: "0 60px" }}>
            <div style={{
              background: "#2a2a2e",
              borderRadius: 28, borderBottomLeftRadius: 6,
              padding: "32px 40px", maxWidth: 720,
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 44, color: "#ffffff", lineHeight: 1.4 }}>
                what's for dinner tonight? 🍽️
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Main close content */}
      {!isFlash && (
        <AbsoluteFill>
          <FullFrameBackground variant="warm" />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div style={{ textAlign: "center", width: 950, padding: "0 40px" }}>
              {/* Logo */}
              <div style={{
                opacity: logoOp,
                transform: `scale(${logoScale})`,
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                marginBottom: 40,
              }}>
                <div style={{
                  width: 90, height: 90, borderRadius: 22, background: SAGE,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                    <line x1="6" y1="17" x2="18" y2="17" />
                  </svg>
                </div>
                <span style={{ fontFamily: fraunces, fontSize: 36, fontWeight: 600, color: "#221F1C" }}>
                  Family Food OS
                </span>
              </div>

              {/* Headline — FIX 9: min 52px */}
              <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 20 }}>
                <span style={{ fontFamily: fraunces, fontSize: 64, fontWeight: 600, color: "#221F1C", lineHeight: 1.15 }}>
                  Plan your real week<br />
                  <span style={{ color: SAGE, fontStyle: "italic" }}>of food.</span>
                </span>
              </div>

              {/* Tagline — FIX 9: min 32px */}
              <div style={{ opacity: taglineOp, marginBottom: 36 }}>
                <span style={{ fontFamily: dmSans, fontSize: 32, color: "#9b9188" }}>
                  5 minutes to set up. Smarter every week after that.
                </span>
              </div>

              {/* CTA — continuous pulse */}
              <div style={{ opacity: ctaOp, transform: `scale(${ctaBaseScale * ctaPulse})`, marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex",
                  background: SAGE,
                  borderRadius: 60,
                  padding: "24px 56px",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <span style={{ fontFamily: dmSans, fontSize: 28, color: "#fff", fontWeight: 600 }}>
                    Start planning for free →
                  </span>
                </div>
              </div>

              {/* Social proof — FIX 9: min 24px */}
              <div style={{ opacity: socialOp }}>
                <span style={{ fontFamily: dmSans, fontSize: 24, color: "#b5afa8" }}>
                  Joined by 200+ families in early access · No credit card required
                </span>
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
