import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import desktopIllustration from "@/assets/home-screen-setup-desktop.png";
import mobileIllustration from "@/assets/home-screen-setup-mobile.png";

const STORAGE_KEY = "home_screen_prompt_seen";

type Device = "ios" | "android" | "desktop";

const detectDevice = (): Device => {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
};

const isStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
};

const HomeScreenSetupCard = () => {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setDevice(detectDevice());
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const handleShowHow = () => setShowHow(true);

  const handleCloseModal = () => {
    setShowHow(false);
    dismiss();
  };

  if (!visible) return null;

  const defaultTab = device === "android" ? "android" : "ios";

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-background backdrop-blur-sm shadow-sm">
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                  <Smartphone className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground leading-tight">
                  Add Family Food OS to your Home Screen
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Use Family Food OS like an app and make dinner check-ins easier to remember.
                </p>
                <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                  Quick access from your phone helps you stay consistent, so your weekly plan gets smarter over time.
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Button onClick={handleShowHow} size="sm" className="h-9">
                    Show me how
                  </Button>
                  <Button onClick={dismiss} variant="ghost" size="sm" className="h-9">
                    Maybe later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showHow} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl gap-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Add Family Food OS to your Home Screen
            </DialogTitle>
            <DialogDescription>
              It only takes a few seconds. Once added, Family Food OS opens like an app from your phone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <img
              src={isMobile ? mobileIllustration : desktopIllustration}
              alt="How to add Family Food OS to your home screen"
              className="w-full rounded-xl border border-border/50"
            />
          </div>

          <Tabs defaultValue={defaultTab} className="mt-5">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ios" className="gap-1.5">
                <Apple className="w-4 h-4" /> iPhone
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-1.5">
                <Smartphone className="w-4 h-4" /> Android
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ios" className="mt-4">
              <ol className="space-y-2.5 text-sm text-foreground">
                <Step n={1}>Open Family Food OS in Safari.</Step>
                <Step n={2}>Tap the <strong>Share</strong> icon.</Step>
                <Step n={3}>Scroll and tap <strong>Add to Home Screen</strong>.</Step>
                <Step n={4}>Tap <strong>Add</strong>.</Step>
              </ol>
            </TabsContent>
            <TabsContent value="android" className="mt-4">
              <ol className="space-y-2.5 text-sm text-foreground">
                <Step n={1}>Open Family Food OS in Chrome.</Step>
                <Step n={2}>Tap the <strong>three-dot menu</strong>.</Step>
                <Step n={3}>Tap <strong>Add to Home screen</strong>.</Step>
                <Step n={4}>Tap <strong>Add</strong>.</Step>
              </ol>
            </TabsContent>
          </Tabs>

          <div className="mt-5 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              After that, come back for quick dinner check-ins so next week's plan fits your family even better.
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={handleCloseModal} size="sm">Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center mt-0.5">
      {n}
    </span>
    <span className="leading-relaxed pt-0.5">{children}</span>
  </li>
);

export default HomeScreenSetupCard;
