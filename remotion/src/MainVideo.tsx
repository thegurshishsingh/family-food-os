import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
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
      {/* Background music */}
      <Audio src={staticFile("audio/bg-music.wav")} volume={0.5} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={50}>
          <Scene0Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        <TransitionSeries.Sequence durationInFrames={145}>
          <Scene2Shift />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        <TransitionSeries.Sequence durationInFrames={175}>
          <Scene4Learning />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 25 })}
        />

        <TransitionSeries.Sequence durationInFrames={175}>
          <Scene5Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
