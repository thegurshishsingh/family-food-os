import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";
const CHARCOAL = "#221F1C";
const CREAM = "#FAF8F5";
const WARM = "#CC8E52";

type Step = {
  title: string;
  options: { label: string; emoji?: string }[];
  selected: number[];
};

const STEPS: Step[] = [
  {
    title: "Who's at your table?",
    options: [
      { label: "2 adults", emoji: "👫" },
      { label: "2 kids", emoji: "🧒" },
      { label: "1 picky eater", emoji: "🙄" },
      { label: "Just me", emoji: "🙋" },
    ],
    selected: [0, 1, 2],
  },
  {
    title: "Any dietary needs?",
    options: [
      { label: "Gluten-free", emoji: "🌾" },
      { label: "Low spice", emoji: "🌶️" },
      { label: "Nut allergy", emoji: "🥜" },
      { label: "No restrictions", emoji: "✓" },
    ],
    selected: [0, 1],
  },
  {
    title: "Weekly grocery budget?",
    options: [
      { label: "$80", emoji: "💰" },
      { label: "$120", emoji: "💰" },
      { label: "$160", emoji: "💰" },
      { label: "$200+", emoji: "💰" },
    ],
    selected: [1],
  },
];

// Each step gets 60 frames. 3 steps = 180 frames.
const STEP_DURATION = 60;

const StepCard: React.FC<{ step: Step; stepIndex: number; localFrame: number; totalSteps: number; fps: number }> = ({
  step, stepIndex, localFrame, totalSteps, fps,
}) => {
  // Card entrance
  const cardP = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 180 } });
  const cardOp = interpolate(cardP, [0, 1], [0, 1]);
  const cardY = interpolate(cardP, [0, 1], [30, 0]);

  // Card exit (last 12 frames)
  const exitStart = STEP_DURATION - 12;
  const exitP = interpolate(localFrame, [exitStart, STEP_DURATION], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp = 1 - exitP;
  const exitY = -exitP * 25;

  return (
    <div style={{
      opacity: cardOp * exitOp,
      transform: `translateY(${cardY + exitY}px)`,
      width: 820,
      background: CREAM,
      borderRadius: 36,
      border: "2px solid #ede6dc",
      padding: "48px 56px 56px",
      boxShadow: "0 30px 80px rgba(34,31,28,0.12)",
    }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 10, marginBottom: 36 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            height: 6, flex: 1, borderRadius: 3,
            background: i <= stepIndex ? SAGE : "#e6dfd5",
          }} />
        ))}
      </div>

      <div style={{
        fontFamily: dmSans, fontSize: 22, fontWeight: 600,
        color: "#9b9188", letterSpacing: 3, textTransform: "uppercase",
        marginBottom: 18,
      }}>
        STEP {stepIndex + 1} OF {totalSteps}
      </div>

      <div style={{
        fontFamily: fraunces, fontSize: 64, fontWeight: 600,
        color: CHARCOAL, lineHeight: 1.05, marginBottom: 40,
      }}>
        {step.title}
      </div>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {step.options.map((opt, i) => {
          const optDelay = 6 + i * 4;
          const optP = spring({ frame: localFrame - optDelay, fps, config: { damping: 18, stiffness: 200 } });
          const optOp = interpolate(optP, [0, 1], [0, 1]);
          const optY = interpolate(optP, [0, 1], [15, 0]);

          const isSelected = step.selected.includes(i);
          const selectAt = 24 + step.selected.indexOf(i) * 6;
          const selectedP = isSelected
            ? spring({ frame: localFrame - selectAt, fps, config: { damping: 12, stiffness: 220 } })
            : 0;
          const selScale = 1 + interpolate(selectedP, [0, 0.5, 1], [0, 0.06, 0]);

          return (
            <div key={i} style={{
              opacity: optOp,
              transform: `translateY(${optY}px) scale(${selScale})`,
              padding: "22px 24px",
              borderRadius: 20,
              background: isSelected && selectedP > 0.1 ? SAGE_LIGHT : "#f6f1ea",
              border: `2px solid ${isSelected && selectedP > 0.1 ? SAGE : "#ede6dc"}`,
              display: "flex", alignItems: "center", gap: 14,
              transition: "none",
            }}>
              <span style={{ fontSize: 30 }}>{opt.emoji}</span>
              <span style={{
                fontFamily: dmSans, fontSize: 28, fontWeight: 600,
                color: CHARCOAL, flex: 1,
              }}>
                {opt.label}
              </span>
              {isSelected && selectedP > 0.1 && (
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: SAGE, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700,
                  transform: `scale(${selectedP})`,
                }}>✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const OnbSceneOnboarding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepIndex = Math.min(Math.floor(frame / STEP_DURATION), STEPS.length - 1);
  const localFrame = frame - stepIndex * STEP_DURATION;
  const currentStep = STEPS[stepIndex];

  // Header opacity
  const headerOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="sage" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 40px" }}>
        <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Sticky header */}
          <div style={{
            opacity: headerOp,
            display: "flex", alignItems: "center", gap: 14, marginBottom: 36,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: SAGE,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: fraunces, fontSize: 32, color: CREAM, fontWeight: 700,
            }}>F</div>
            <span style={{
              fontFamily: fraunces, fontSize: 40, fontWeight: 600, color: CHARCOAL,
            }}>
              Let's get to know your family
            </span>
          </div>

          <StepCard
            key={stepIndex}
            step={currentStep}
            stepIndex={stepIndex}
            localFrame={localFrame}
            totalSteps={STEPS.length}
            fps={fps}
          />

          {/* Time indicator */}
          <div style={{
            opacity: interpolate(frame, [20, 32], [0, 1], { extrapolateRight: "clamp" }),
            marginTop: 40,
            padding: "14px 28px",
            background: "rgba(74,124,107,0.08)",
            borderRadius: 999,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", background: WARM,
            }} />
            <span style={{
              fontFamily: dmSans, fontSize: 24, fontWeight: 600, color: SAGE,
            }}>
              No recipes to browse. No accounts to link. Just answers.
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
