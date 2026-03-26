import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene0Hook } from "./scenes/Scene0Hook";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene3WeeklyPlan } from "./scenes/Scene3WeeklyPlan";
import { Scene5Close } from "./scenes/Scene5Close";

// 15-second social cut:
// Scene 0: 30f (1s)
// Scene 1: 60f (2s)
// Scene 3: 210f (7s)
// Scene 5: 150f (5s)
// Total: 450f (15s)

export const SocialCut: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/bg-music-v5.mp3")} volume={0.2} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene0Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        <TransitionSeries.Sequence durationInFrames={60}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 10 })}
        />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene5Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
