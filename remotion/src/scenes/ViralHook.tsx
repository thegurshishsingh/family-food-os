import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { MossBackground, BrandMark } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

export const ViralHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markP = spring({ frame, fps, config: { damping: 18, stiffness: 180 } });
  const markScale = interpolate(markP, [0, 1], [0.6, 1]);
  const markOp = interpolate(markP, [0, 1], [0, 1]);

  const lineA = spring({ frame: frame - 8, fps, config: { damping: 16, stiffness: 150 } });
  const lineB = spring({ frame: frame - 28, fps, config: { damping: 14, stiffness: 150 } });
  const strikeP = interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const replaceP = spring({ frame: frame - 60, fps, config: { damping: 14, stiffness: 160 } });
  const replaceOp = interpolate(replaceP, [0, 1], [0, 1]);
  const replaceY = interpolate(replaceP, [0, 1], [24, 0]);

  return (
    <AbsoluteFill>
      <MossBackground />
      <AbsoluteFill style={{ padding: "100px 80px", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Logo lockup */}
        <div style={{
          opacity: markOp,
          transform: `scale(${markScale})`,
          transformOrigin: "left center",
          display: "flex", alignItems: "center", gap: 18,
        }}>
          <BrandMark size={72} color={BRAND.softCream} />
          <span style={{
            fontFamily: sora, fontWeight: 700, fontSize: 38,
            color: BRAND.softCream, letterSpacing: -1,
          }}>
            Family Food OS
          </span>
        </div>

        {/* Main statement */}
        <div>
          <div style={{
            opacity: interpolate(lineA, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineA, [0, 1], [30, 0])}px)`,
            fontFamily: sora, fontWeight: 800, fontSize: 130,
            color: BRAND.softCream, lineHeight: 1.0, letterSpacing: -4,
          }}>
            Dinner isn't a
          </div>
          <div style={{
            opacity: interpolate(lineB, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(lineB, [0, 1], [30, 0])}px)`,
            fontFamily: sora, fontWeight: 800, fontSize: 130,
            color: BRAND.softCream, lineHeight: 1.0, letterSpacing: -4,
            marginTop: 4, position: "relative", display: "inline-block",
          }}>
            recipe problem.
            {/* strike-through */}
            <div style={{
              position: "absolute", left: 0, top: "55%",
              height: 10, background: BRAND.softAmber,
              width: `${strikeP * 100}%`, borderRadius: 4,
            }} />
          </div>

          <div style={{
            opacity: replaceOp,
            transform: `translateY(${replaceY}px)`,
            fontFamily: sora, fontWeight: 700, fontSize: 110,
            color: BRAND.softAmber, lineHeight: 1.0, letterSpacing: -3,
            marginTop: 36,
          }}>
            It's a <span style={{ fontStyle: "italic" }}>coordination</span>
          </div>
          <div style={{
            opacity: replaceOp,
            transform: `translateY(${replaceY}px)`,
            fontFamily: sora, fontWeight: 700, fontSize: 110,
            color: BRAND.softAmber, lineHeight: 1.0, letterSpacing: -3,
            marginTop: 4,
          }}>
            problem.
          </div>
        </div>

        <div style={{
          opacity: interpolate(frame, [80, 96], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: inter, fontSize: 32, fontWeight: 500,
          color: BRAND.mutedSage, letterSpacing: 0.5,
        }}>
          So we built the operating system for it.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
