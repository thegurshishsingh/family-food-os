import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatHours, type TimeSavedResult } from "@/lib/timeSaved";
import type { HumanReward } from "@/lib/humanReward";

interface ShareableRecapCardProps {
  result: TimeSavedResult;
  cumulativeMinutes: number;
  totalWeeks: number;
  plannedNights: number;
  humanRewards: HumanReward[];
  householdName?: string;
}

const CARD_W = 1080;
const CARD_H = 1080;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderCard(
  canvas: HTMLCanvasElement,
  result: TimeSavedResult,
  cumulativeMinutes: number,
  _totalWeeks: number,
  _plannedNights: number,
  humanRewards: HumanReward[],
  householdName: string,
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, "#f8f6f2");
  bg.addColorStop(1, "#f0ede7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Subtle radial glow
  const glow = ctx.createRadialGradient(CARD_W / 2, 340, 0, CARD_W / 2, 340, 360);
  glow.addColorStop(0, "rgba(74, 140, 111, 0.06)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const pad = 100;
  const cx = CARD_W / 2;

  // ── TOP LABEL ──
  ctx.fillStyle = "#9a9590";
  ctx.font = "500 16px 'DM Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("LAST WEEK RECAP", cx, 130);
  ctx.letterSpacing = "0px";

  // ── HERO NUMBER ──
  ctx.fillStyle = "#4a8c6f";
  ctx.font = "700 72px 'Fraunces', Georgia, serif";
  ctx.fillText(formatHours(result.totalMinutesSaved), cx, 260);

  ctx.fillStyle = "#1f1d1a";
  ctx.font = "600 38px 'Fraunces', Georgia, serif";
  ctx.fillText("back.", cx, 310);

  // ── SUPPORTING COPY ──
  ctx.fillStyle = "#9a9590";
  ctx.font = "400 20px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("From smarter planning, fewer scrambles,", cx, 370);
  ctx.fillText("and a week that mostly ran itself.", cx, 398);

  // ── DIVIDER ──
  ctx.fillStyle = "rgba(74, 140, 111, 0.12)";
  ctx.fillRect(pad + 80, 440, CARD_W - (pad + 80) * 2, 1);

  // ── KPIs (inline) ──
  const kpiY = 500;
  // Left KPI
  ctx.textAlign = "center";
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "700 40px 'Fraunces', Georgia, serif";
  ctx.fillText(formatHours(result.totalMinutesSaved), cx - 140, kpiY);
  ctx.fillStyle = "#9a9590";
  ctx.font = "400 16px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("this week", cx - 140, kpiY + 28);

  // Divider
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(cx, kpiY - 30, 1, 60);

  // Right KPI
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "700 40px 'Fraunces', Georgia, serif";
  ctx.fillText(formatHours(cumulativeMinutes), cx + 140, kpiY);
  ctx.fillStyle = "#9a9590";
  ctx.font = "400 16px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("all time", cx + 140, kpiY + 28);

  // ── EMOTIONAL PAYOFF ──
  if (humanRewards.length > 0) {
    const reward = humanRewards[0];
    ctx.fillStyle = "#1f1d1a";
    ctx.font = "500 26px 'Fraunces', Georgia, serif";
    ctx.fillText(`${reward.emoji}  ${reward.text}`, cx, 620);
  }

  // ── HOUSEHOLD NAME ──
  ctx.fillStyle = "#b5b0a8";
  ctx.font = "400 18px 'DM Sans', system-ui, sans-serif";
  ctx.fillText(householdName, cx, 690);

  // ── FOOTER ──
  ctx.fillStyle = "rgba(74, 140, 111, 0.10)";
  ctx.fillRect(pad + 80, CARD_H - 100, CARD_W - (pad + 80) * 2, 1);
  ctx.fillStyle = "#b5b0a8";
  ctx.font = "400 16px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("familyfoodOS.com", cx, CARD_H - 60);

  ctx.textAlign = "start";
}

const ShareableRecapCard = ({
  result,
  cumulativeMinutes,
  totalWeeks,
  plannedNights,
  humanRewards,
  householdName = "Our Family",
}: ShareableRecapCardProps) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generate = useCallback(() => {
    setOpen(true);
    // Wait for dialog to mount canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderCard(canvas, result, cumulativeMinutes, totalWeeks, plannedNights, humanRewards, householdName);
      setPreviewUrl(canvas.toDataURL("image/png"));
    }, 100);
  }, [result, cumulativeMinutes, totalWeeks, plannedNights, humanRewards, householdName]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "family-food-os-recap.png";
    a.click();
    toast({ title: "Image downloaded!", description: "Share it on your favorite social platform." });
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not generate image");
      const file = new File([blob], "family-food-os-recap.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My Family Food OS Recap",
          text: `My family got ${formatHours(result.totalMinutesSaved)} back last week with Family Food OS!`,
          files: [file],
        });
      } else {
        // Fallback: copy image to clipboard if possible
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          toast({ title: "Image copied to clipboard!", description: "Paste it into your favorite app." });
        } catch {
          // Final fallback: just download
          handleDownload();
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ variant: "destructive", title: "Share failed", description: e.message });
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={generate}
        className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
      >
        <ImageIcon className="w-3.5 h-3.5" />
        Share as image
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Your Weekly Recap Card</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Weekly recap card"
                className="w-full rounded-lg border border-border shadow-sm"
              />
            )}
            <div className="flex gap-3 w-full">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareableRecapCard;
