import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { FullFrameBackground } from "../components/Background";

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

// FIX 6: Week comparison data
const WEEK1_PLAN = [
  { mode: "COOK", color: SAGE },
  { mode: "COOK", color: SAGE },
  { mode: "COOK", color: SAGE },
  { mode: "COOK", color: SAGE },
  { mode: "COOK", color: SAGE },
  { mode: "TAKEOUT", color: "#d4874d" },
  { mode: "COOK", color: SAGE },
];

const WEEK4_PLAN = [
  { mode: "COOK", color: SAGE },
  { mode: "LEFT", color: "#CC8E52" },
  { mode: "COOK", color: SAGE },
  { mode: "LEFT", color: "#CC8E52" },
  { mode: "OUT", color: "#c56b6b" },
  { mode: "COOK", color: SAGE },
  { mode: "LEFT", color: "#CC8E52" },
];

export const Scene4Learning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // FIX 9: Headline min 52px, positioned in upper third
  const headlineProgress = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 160 } });
  const headlineOp = interpolate(headlineProgress, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineProgress, [0, 1], [20, 0]);

  // Check-in card — FIX 1: full width with 24px margins
  const cardProgress = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 160 } });
  const cardOp = interpolate(cardProgress, [0, 1], [0, 1]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.96, 1]);

  // Insight card
  const insightProgress = spring({ frame: frame - 60, fps, config: { damping: 14, stiffness: 160 } });
  const insightOp = interpolate(insightProgress, [0, 1], [0, 1]);
  const insightY = interpolate(insightProgress, [0, 1], [20, 0]);

  // FIX 6: Week comparison cards
  const comparisonProgress = spring({ frame: frame - 78, fps, config: { damping: 14, stiffness: 160 } });
  const compOp = interpolate(comparisonProgress, [0, 1], [0, 1]);
  const compY = interpolate(comparisonProgress, [0, 1], [30, 0]);

  return (
    <AbsoluteFill>
      <FullFrameBackground variant="sage" />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 140 }}>
        <div style={{ width: 1032, textAlign: "center", padding: "0 24px" }}>
          {/* Headline */}
          <div style={{ opacity: headlineOp, transform: `translateY(${headlineY}px)`, marginBottom: 36 }}>
            <span style={{ fontFamily: fraunces, fontSize: 54, fontWeight: 600, color: "#221F1C", lineHeight: 1.2 }}>
              It gets smarter<br />
              <span style={{ color: SAGE, fontStyle: "italic" }}>every week.</span>
            </span>
          </div>

          {/* FIX 1: Full-width check-in card */}
          <div
            style={{
              opacity: cardOp,
              transform: `scale(${cardScale})`,
              background: "#fff",
              borderRadius: 24,
              border: "2px solid #e5e2dd",
              padding: "28px 32px",
              textAlign: "left" as const,
              marginBottom: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
              width: "100%",
            }}
          >
            <div style={{ fontFamily: fraunces, fontSize: 28, fontWeight: 600, color: "#221F1C", marginBottom: 6 }}>
              Dinner Check-In
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 22, color: "#9b9188", marginBottom: 20 }}>
              A 10-second nightly ritual
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 24, color: "#555", marginBottom: 16 }}>
              How did dinner go tonight?
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12 }}>
              {CHIPS.map((chip, i) => {
                const delay = 30 + i * 10;
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
                      padding: "10px 22px",
                      fontFamily: dmSans, fontSize: 22, fontWeight: 600,
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
              padding: "20px 28px",
              marginBottom: 20,
              textAlign: "left" as const,
              width: "100%",
            }}
          >
            <span style={{ fontFamily: dmSans, fontSize: 24, color: SAGE, fontWeight: 500, fontStyle: "italic" }}>
              💡 Got it. Thursdays should stay low-effort for your family.
            </span>
          </div>

          {/* FIX 6: Week comparison */}
          <div
            style={{
              opacity: compOp,
              transform: `translateY(${compY}px)`,
              display: "flex",
              gap: 20,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* Week 1 */}
            <div style={{
              background: "#fff", borderRadius: 18, border: "2px solid #e5e2dd",
              padding: "20px 22px", flex: 1,
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: "#9b9188", marginBottom: 12, textAlign: "center" as const }}>
                Week 1
              </div>
              {WEEK1_PLAN.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginBottom: i < 6 ? 6 : 0,
                }}>
                  <div style={{
                    background: d.color, borderRadius: 6,
                    padding: "3px 10px",
                    fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                    color: "#fff", minWidth: 60, textAlign: "center" as const,
                  }}>{d.mode}</div>
                </div>
              ))}
              <div style={{ fontFamily: dmSans, fontSize: 16, color: "#c56b6b", fontWeight: 600, marginTop: 10, textAlign: "center" as const }}>
                5 cook nights 😰
              </div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 40, color: SAGE }}>→</div>

            {/* Week 4 */}
            <div style={{
              background: "#fff", borderRadius: 18, border: `2px solid ${SAGE}`,
              padding: "20px 22px", flex: 1,
              boxShadow: `0 4px 20px rgba(74,124,107,0.12)`,
            }}>
              <div style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: SAGE, marginBottom: 12, textAlign: "center" as const }}>
                Week 4
              </div>
              {WEEK4_PLAN.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginBottom: i < 6 ? 6 : 0,
                }}>
                  <div style={{
                    background: d.color, borderRadius: 6,
                    padding: "3px 10px",
                    fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                    color: "#fff", minWidth: 60, textAlign: "center" as const,
                  }}>{d.mode}</div>
                </div>
              ))}
              <div style={{ fontFamily: dmSans, fontSize: 16, color: SAGE, fontWeight: 600, marginTop: 10, textAlign: "center" as const }}>
                3 cook + smart leftovers ✨
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
