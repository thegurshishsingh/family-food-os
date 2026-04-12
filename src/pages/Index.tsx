import { useIsMobile } from "@/hooks/use-mobile";
import Landing from "./Landing";
import MobileWelcome from "@/components/landing/MobileWelcome";

const Index = () => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileWelcome /> : <Landing />;
};

export default Index;
