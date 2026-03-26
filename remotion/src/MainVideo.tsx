import React from "react";
import { AbsoluteFill, Audio, staticFile, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene0Hook } from "./scenes/Scene0Hook";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Shift } from "./scenes/Scene2Shift";
import { Scene3WeeklyPlan } from "./scenes/Scene3WeeklyPlan";
import { Scene4Learning } from "./scenes/Scene4Learning";
import { Scene5Close } from "./scenes/Scene5Close";

// Scene durations (FIX 10):
// Scene 0: 30f (1s)
// Scene 1: 90f (3s)
// Scene 2: 120f (4s)
// Scene 3: 210f (7s)
// Scene 4: 120f (4s)
// Scene 5: 120f (4s)
// Total: 690f (23s)
// Using fade transitions of 15 frames — NO overlap bleeding (FIX 2)

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background music at 20% volume */}
      <Audio src={staticFile("audio/bg-music-v5.mp3")} volume={0.2} />

      {/* SFX layers */}
      <Sequence from={0}>
        <Audio src={staticFile("audio/sfx-stamp.mp3")} volume={0.8} startFrom={0} />
      </Sequence>

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene0Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={90}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene2Shift />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene4Learning />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene5Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
