import { ReactNode } from "react";
import { motion } from "framer-motion";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileLayoutProps {
  children: ReactNode;
  title: string;
  showBack?: boolean;
}

const MobileLayout = ({ children, title }: MobileLayoutProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title={title} />
      <motion.main
        className="flex-1 pb-20"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.main>
      <BottomNav />
    </div>
  );
};

export default MobileLayout;
