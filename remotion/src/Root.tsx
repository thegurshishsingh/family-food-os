import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { SocialCut } from "./SocialCut";
import { OnboardingPromo } from "./OnboardingPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="main"
        component={MainVideo}
        durationInFrames={690}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="social-15s"
        component={SocialCut}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="onboarding-promo"
        component={OnboardingPromo}
        durationInFrames={692}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};

