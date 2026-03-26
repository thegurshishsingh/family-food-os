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

// Scene layout (accounting for 15-frame fade transitions):
// Scene 0: frames 0-29 (30f)
// Transition: 15f overlap
// Scene 1: starts ~15, 90f duration
// Transition: 15f overlap
// Scene 2: starts ~90, 120f duration
// Transition: 15f overlap
// Scene 3: starts ~195, 210f duration
// Transition: 15f overlap
// Scene 4: starts ~390, 120f duration
// Transition: 15f overlap
// Scene 5: starts ~495, 120f duration
// Total effective: 690 - 5*15 = 615... let me calculate properly
//
// With TransitionSeries, total = sum(durations) - sum(transitions)
// = (30+90+120+210+120+120) - 5*15 = 690 - 75 = 615
// But we want 690 total frames. Adjust durations up.
// Adding 75/6 ≈ 12-13 frames to each scene to compensate.
// Or: just use the right total. 615 frames = 20.5s
// Actually for 23s = 690f total, we need durations summing to 690+75 = 765
//
// Revised durations:
// Scene 0: 30f
// Scene 1: 100f (was 90)
// Scene 2: 135f (was 120)
// Scene 3: 225f (was 210)
// Scene 4: 135f (was 120)
// Scene 5: 140f (was 120)
// Sum = 765, minus 5*15 = 75, effective = 690f = 23s ✓

// Absolute frame positions for SFX (approximate):
// Scene 0 starts at frame 0
// Scene 1 starts at frame 30-15 = 15
// Scene 1 X stamp at frame 15+48 = 63
// Scene 2 starts at frame 15+100-15 = 100
// Scene 3 starts at frame 100+135-15 = 220
// Scene 3 meal rows start at frame 220 + 38 + i*14
// Scene 3 reality score at 220+24 = 244
// Scene 4 starts at frame 220+225-15 = 430
// Scene 4 insight at 430+60 = 490
// Scene 5 starts at frame 430+135-15 = 550
// Scene 5 CTA at 550+15+40 = 605

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background music at 20% volume (FIX 8) */}
      <Audio src={staticFile("audio/bg-music-v5.mp3")} volume={0.2} />

      {/* SFX: Stamp impact (Scene 1 X appears) */}
      <Sequence from={63}>
        <Audio src={staticFile("audio/sfx-stamp.mp3")} volume={0.8} />
      </Sequence>

      {/* SFX: Whoosh for each meal row in Scene 3 */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Sequence key={`whoosh-${i}`} from={258 + i * 14}>
          <Audio src={staticFile("audio/sfx-whoosh.mp3")} volume={0.6} />
        </Sequence>
      ))}

      {/* SFX: Ding for Reality Score */}
      <Sequence from={244}>
        <Audio src={staticFile("audio/sfx-ding.mp3")} volume={0.7} />
      </Sequence>

      {/* SFX: Chime for Scene 4 insight card */}
      <Sequence from={490}>
        <Audio src={staticFile("audio/sfx-chime.mp3")} volume={0.7} />
      </Sequence>

      {/* SFX: Success tone for Scene 5 CTA */}
      <Sequence from={605}>
        <Audio src={staticFile("audio/sfx-success.mp3")} volume={0.7} />
      </Sequence>

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={30}>
          <Scene0Hook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene1Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene2Shift />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={225}>
          <Scene3WeeklyPlan />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={135}>
          <Scene4Learning />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
