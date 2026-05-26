import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ViralHook } from "./scenes/ViralHook";
import { ViralProblem } from "./scenes/ViralProblem";
import { ViralWeeklyPlan } from "./scenes/ViralWeeklyPlan";
import { ViralPayoff } from "./scenes/ViralPayoff";

// 15s cut (450 frames @ 30fps). Fast punch: hook → problem → plan → payoff.
// 100 + 110 + 130 + 130 = 470 − (3 × 10 fade overlap) = 440. Add 10 to first scene.
export const ViralX15: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <ViralHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={110}>
          <ViralProblem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <ViralWeeklyPlan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <ViralPayoff />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
