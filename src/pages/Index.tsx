import { useIsMobile } from "@/hooks/use-mobile";
import Landing from "./Landing";
import MobileWelcome from "@/components/landing/MobileWelcome";

const Index = () => {
  const isMobile = useIsMobile();

  // Show undefined state briefly while detecting
  if (isMobile === undefined) return null;

  return isMobile ? <MobileWelcome /> : <Landing />;
};

export default Index;
