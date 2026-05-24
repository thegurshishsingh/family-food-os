import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ViralHook } from "./scenes/ViralHook";
import { ViralProblem } from "./scenes/ViralProblem";
import { ViralOnboarding } from "./scenes/ViralOnboarding";
import { ViralGeneration } from "./scenes/ViralGeneration";
import { ViralWeeklyPlan } from "./scenes/ViralWeeklyPlan";
import { ViralPayoff } from "./scenes/ViralPayoff";

// Durations @ 30fps. Raw sum minus (5 fades × 10f overlap) = effective frames.
// 110 + 130 + 170 + 90 + 180 + 150 = 830, minus 50 = 780 frames = 26s
export const ViralX: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <ViralHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <ViralProblem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <ViralOnboarding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={90}>
          <ViralGeneration />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={180}>
          <ViralWeeklyPlan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={150}>
          <ViralPayoff />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
