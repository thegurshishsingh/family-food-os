import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CreamBackground } from "../components/BrandBackground";
import { BRAND } from "../brand";

const { fontFamily: sora } = loadSora();
const { fontFamily: inter } = loadInter();

type Step = { title: string; options: string[]; selected: number[] };

const STEPS: Step[] = [
  { title: "Who's at your table?", options: ["2 adults", "2 kids", "1 picky eater", "Just me"], selected: [0, 1, 2] },
  { title: "Any dietary needs?", options: ["Gluten-free", "Low spice", "Nut allergy", "No restrictions"], selected: [0, 1] },
  { title: "Weekly grocery budget?", options: ["$80", "$120", "$160", "$200+"], selected: [1] },
];

const STEP_DURATION = 55;

const StepCard: React.FC<{ step: Step; idx: number; localFrame: number; total: number; fps: number }> = ({
  step, idx, localFrame, total, fps,
}) => {
  const cardP = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 180 } });
  const cardOp = interpolate(cardP, [0, 1], [0, 1]);
  const cardY = interpolate(cardP, [0, 1], [30, 0]);
  const exitP = interpolate(localFrame, [STEP_DURATION - 10, STEP_DURATION], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{
      opacity: cardOp * (1 - exitP),
      transform: `translateY(${cardY - exitP * 20}px)`,
      width: 860,
      background: BRAND.pureWhite,
      borderRadius: 32,
      border: `1px solid ${BRAND.creamWarm}`,
      padding: "44px 52px 52px",
      boxShadow: "0 30px 80px rgba(31,31,31,0.08)",
    }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            height: 6, flex: 1, borderRadius: 3,
            background: i <= idx ? BRAND.deepMoss : BRAND.creamWarm,
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: inter, fontSize: 20, fontWeight: 700,
        color: BRAND.warmGray, letterSpacing: 3, textTransform: "uppercase",
        marginBottom: 14,
      }}>
        STEP {idx + 1} OF {total}
      </div>
      <div style={{
        fontFamily: sora, fontSize: 62, fontWeight: 700,
        color: BRAND.charcoal, lineHeight: 1.05, marginBottom: 36, letterSpacing: -2,
      }}>
        {step.title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {step.options.map((label, i) => {
          const optDelay = 5 + i * 3;
          const optP = spring({ frame: localFrame - optDelay, fps, config: { damping: 18, stiffness: 200 } });
          const op = interpolate(optP, [0, 1], [0, 1]);
          const isSel = step.selected.includes(i);
          const selAt = 20 + step.selected.indexOf(i) * 5;
          const selP = isSel ? spring({ frame: localFrame - selAt, fps, config: { damping: 12, stiffness: 220 } }) : 0;
          const visible = selP > 0.1;
          return (
            <div key={i} style={{
              opacity: op,
              padding: "22px 24px",
              borderRadius: 18,
              background: visible ? BRAND.sageTint : BRAND.softCream,
              border: `2px solid ${visible ? BRAND.deepMoss : BRAND.creamWarm}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 14,
            }}>
              <span style={{
                fontFamily: inter, fontSize: 28, fontWeight: 600,
                color: BRAND.charcoal,
              }}>
                {label}
              </span>
              {visible && (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: BRAND.deepMoss, color: BRAND.softCream,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, transform: `scale(${selP})`,
                }}>✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ViralOnboarding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const idx = Math.min(Math.floor(frame / STEP_DURATION), STEPS.length - 1);
  const local = frame - idx * STEP_DURATION;
  const cur = STEPS[idx];

  return (
    <AbsoluteFill>
      <CreamBackground />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 40px" }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
        }}>
          <div style={{
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: inter, fontSize: 24, fontWeight: 700,
            letterSpacing: 5, color: BRAND.deepMoss, textTransform: "uppercase",
            marginBottom: 12,
          }}>
            STEP 1 · TELL US ABOUT YOUR FAMILY
          </div>
          <div style={{
            opacity: interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: sora, fontWeight: 700, fontSize: 56,
            color: BRAND.charcoal, marginBottom: 40, letterSpacing: -1.5,
          }}>
            3 questions. <span style={{ color: BRAND.deepMoss }}>90 seconds.</span>
          </div>
          <StepCard key={idx} step={cur} idx={idx} localFrame={local} total={STEPS.length} fps={fps} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
