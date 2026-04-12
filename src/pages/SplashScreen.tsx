import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/cb3b18e2-2443-4f09-9a29-12bfcf41aa76.jpg";

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={(def: any) => {
        // We use a timeout approach instead
      }}
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          setTimeout(() => onFinished(), 1500);
        }}
      >
        <img
          src={logoImg}
          alt="Family Food OS"
          className="w-20 h-20 rounded-2xl object-cover shadow-lg"
        />
        <span className="font-serif text-xl font-semibold text-foreground">
          Family Food OS
        </span>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
