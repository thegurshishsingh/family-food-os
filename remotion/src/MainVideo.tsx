import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Scene0Hook } from "./scenes/Scene0Hook";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Shift } from "./scenes/Scene2Shift";
import { Scene3WeeklyPlan } from "./scenes/Scene3WeeklyPlan";
import { Scene4Learning } from "./scenes/Scene4Learning";
import { Scene5Close } from "./scenes/Scene5Close";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 0: Hook - 30 frames */}
        <TransitionSeries.Sequence durationInFrames={50}>
          <Scene0Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 1: Problem - 120 frames */}
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* Scene 2: Shift - 120 frames */}
        <TransitionSeries.Sequence durationInFrames={145}>
          <Scene2Shift />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 3: Weekly Plan - 210 frames */}
        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* Scene 4: Learning - 150 frames */}
        <TransitionSeries.Sequence durationInFrames={175}>
          <Scene4Learning />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        {/* Scene 5: Close - 150 frames */}
        <TransitionSeries.Sequence durationInFrames={175}>
          <Scene5Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
