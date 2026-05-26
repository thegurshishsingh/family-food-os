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

// 35s extended cut (1050 frames @ 30fps). Same beats as 26s, with breathing room.
// 140+170+200+130+230+230 = 1100 − (5 × 10 fade overlap) = 1050.
export const ViralX35: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={140}>
          <ViralHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <ViralProblem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={200}>
          <ViralOnboarding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <ViralGeneration />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={230}>
          <ViralWeeklyPlan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
        <TransitionSeries.Sequence durationInFrames={230}>
          <ViralPayoff />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
