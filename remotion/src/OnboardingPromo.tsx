import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { OnbSceneHook } from "./scenes/OnbSceneHook";
import { OnbSceneOnboarding } from "./scenes/OnbSceneOnboarding";
import { OnbSceneGeneration } from "./scenes/OnbSceneGeneration";
import { Scene3WeeklyPlan } from "./scenes/Scene3WeeklyPlan";
import { OnbSceneSavings } from "./scenes/OnbSceneSavings";

// Durations (frames @ 30fps)
// Hook: 75, Onboarding: 195 (3 x 60 + buffer), Generation: 110, Plan: 195, Savings: 165
// Fade transitions: 12 frames each, 4 fades
// Total raw: 75+195+110+195+165 = 740, minus 4*12 = 48 → 692 frames ≈ 23.1s

export const OnboardingPromo: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={75}>
          <OnbSceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={195}>
          <OnbSceneOnboarding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <OnbSceneGeneration />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={165}>
          <OnbSceneSavings />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
