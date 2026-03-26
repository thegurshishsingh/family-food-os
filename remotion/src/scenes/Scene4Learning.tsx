import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

const { fontFamily: fraunces } = loadFraunces();
const { fontFamily: dmSans } = loadDMSans();

const SAGE = "#4A7C6B";
const SAGE_LIGHT = "#E2EDE8";

const CHIPS = [
  { label: "✓ Cooked it", selected: true },
  { label: "Ordered out instead", selected: false },
  { label: "✓ Kids liked it", selected: true },
  { label: "Too much work", selected: false },
];

const LEARNINGS = [
  "Wednesdays often become takeout",
  "Kids prefer low-spice meals",
  "Thursdays → under 25 min",
];

export const Scene4Learning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline
  const headlineProgress = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  // Check-in card
  const cardProgress = spring({ frame: frame - 25, fps, config: { damping: 14, stiffness: 160 } });
  const cardOp = interpolate(cardProgress, [0, 1], [0, 1]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.94, 1]);

  // Insight card
  const insightProgress = spring({ frame: frame - 85, fps, config: { damping: 14, stiffness: 160 } });
  const insightOp = interpolate(insightProgress, [0, 1], [0, 1]);
  const insightY = interpolate(insightProgress, [0, 1], [20, 0]);

  // Learnings card
  const learningsProgress = spring({ frame: frame - 105, fps, config: { damping: 14, stiffness: 160 } });
  const learningsOp = interpolate(learningsProgress, [0, 1], [0, 1]);
  const learningsY = interpolate(learningsProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F5", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 850, textAlign: "center" }}>
        {/* Headline */}
        <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 50 }}>
          <span style={{ fontFamily: fraunces, fontSize: 58, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
            It gets smarter<br />
            <span style={{ color: SAGE, fontStyle: "italic" }}>every week.</span>
          </span>
        </div>

        {/* Check-in card */}
        <div
          style={{
            opacity: cardOp,
            transform: `scale(${cardScale})`,
            background: "#fff",
            borderRadius: 24,
            border: "2px solid #e5e2dd",
            padding: "36px 40px",
            textAlign: "left" as const,
            marginBottom: 20,
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontFamily: fraunces, fontSize: 28, fontWeight: 600, color: "#221F1C", marginBottom: 8 }}>
            Dinner Check-In
          </div>
          <div style={{ fontFamily: dmSans, fontSize: 20, color: "#9b9188", marginBottom: 24 }}>
            A 10-second nightly ritual that helps the system learn.
          </div>
          <div style={{ fontFamily: dmSans, fontSize: 22, color: "#555", marginBottom: 18 }}>
            How did dinner go tonight?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12 }}>
            {CHIPS.map((chip, i) => {
              const delay = 40 + i * 18;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
              const op = interpolate(prog, [0, 1], [0, 1]);
              const scale = interpolate(prog, [0, 1], [0.9, 1]);
              return (
                <div
                  key={i}
                  style={{
                    opacity: op,
                    transform: `scale(${scale})`,
                    background: chip.selected ? SAGE_LIGHT : "#f5f3f0",
                    border: chip.selected ? `2px solid ${SAGE}` : "2px solid #e5e2dd",
                    borderRadius: 50,
                    padding: "12px 24px",
                    fontFamily: dmSans,
                    fontSize: 20,
                    fontWeight: 600,
                    color: chip.selected ? SAGE : "#9b9188",
                  }}
                >
                  {chip.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div
          style={{
            opacity: insightOp,
            transform: `translateY(${insightY}px)`,
            background: SAGE_LIGHT,
            borderRadius: 18,
            padding: "22px 32px",
            marginBottom: 20,
            textAlign: "left" as const,
          }}
        >
          <span style={{ fontFamily: dmSans, fontSize: 22, color: SAGE, fontWeight: 500, fontStyle: "italic" }}>
            Got it. Thursdays should stay low-effort for your family.
          </span>
        </div>

        {/* Learnings */}
        <div
          style={{
            opacity: learningsOp,
            transform: `translateY(${learningsY}px)`,
            background: "#fff",
            borderRadius: 20,
            border: "2px solid #e5e2dd",
            padding: "28px 36px",
            textAlign: "left" as const,
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700,
            letterSpacing: 3, color: "#9b9188", textTransform: "uppercase" as const, marginBottom: 20,
          }}>
            THIS WEEK'S LEARNING
          </div>
          {LEARNINGS.map((item, i) => {
            const delay = 115 + i * 18;
            const prog = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
            const op = interpolate(prog, [0, 1], [0, 1]);
            const y = interpolate(prog, [0, 1], [12, 0]);
            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: i < LEARNINGS.length - 1 ? 16 : 0,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                <span style={{ fontFamily: dmSans, fontSize: 22, color: "#221F1C", fontWeight: 500 }}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
