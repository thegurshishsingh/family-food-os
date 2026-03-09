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
  totalWeeks: number,
  plannedNights: number,
  humanRewards: HumanReward[],
  householdName: string,
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = CARD_W;
  canvas.height = CARD_H;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#f6f4f0");
  bg.addColorStop(0.5, "#f0eeea");
  bg.addColorStop(1, "#eae6df");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Subtle decorative circles
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#4a8c6f";
  ctx.beginPath(); ctx.arc(900, 120, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(180, 900, 160, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const pad = 80;
  let y = pad;

  // App badge
  ctx.fillStyle = "rgba(74, 140, 111, 0.12)";
  drawRoundedRect(ctx, pad, y, 340, 44, 22);
  ctx.fill();
  ctx.fillStyle = "#4a8c6f";
  ctx.font = "600 20px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("✨ Family Food OS", pad + 20, y + 29);
  y += 76;

  // Headline
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "700 54px 'Fraunces', Georgia, serif";
  const headline = `We got ${formatHours(result.totalMinutesSaved)} back`;
  ctx.fillText(headline, pad, y);
  y += 36;
  ctx.font = "700 54px 'Fraunces', Georgia, serif";
  ctx.fillText("last week.", pad, y + 42);
  y += 100;

  // Subtitle
  ctx.fillStyle = "#6b6560";
  ctx.font = "400 24px 'DM Sans', system-ui, sans-serif";
  ctx.fillText(`from ${plannedNights} planned meals · ${householdName}`, pad, y);
  y += 60;

  // Divider
  ctx.fillStyle = "rgba(74, 140, 111, 0.2)";
  ctx.fillRect(pad, y, CARD_W - pad * 2, 2);
  y += 40;

  // KPI row
  const kpis = [
    { value: formatHours(result.totalMinutesSaved), label: "Saved this week" },
    { value: formatHours(cumulativeMinutes), label: `Total (${totalWeeks} wk${totalWeeks !== 1 ? "s" : ""})` },
    { value: `${plannedNights}`, label: "Meals planned" },
  ];
  const kpiW = (CARD_W - pad * 2) / 3;
  kpis.forEach((kpi, i) => {
    const kx = pad + i * kpiW;
    // KPI card bg
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    drawRoundedRect(ctx, kx, y, kpiW - 16, 110, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(74, 140, 111, 0.15)";
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, kx, y, kpiW - 16, 110, 16);
    ctx.stroke();
    // Value
    ctx.fillStyle = "#4a8c6f";
    ctx.font = "700 36px 'Fraunces', Georgia, serif";
    ctx.fillText(kpi.value, kx + 20, y + 50);
    // Label
    ctx.fillStyle = "#8a8580";
    ctx.font = "500 18px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(kpi.label, kx + 20, y + 84);
  });
  y += 140;

  // Top factors
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "600 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Where the time came from", pad, y + 6);
  y += 40;

  const topFactors = result.factors.slice(0, 4);
  topFactors.forEach((f) => {
    ctx.fillStyle = "#4a8c6f";
    ctx.beginPath(); ctx.arc(pad + 8, y + 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a3530";
    ctx.font = "400 22px 'DM Sans', system-ui, sans-serif";
    const label = f.label.length > 50 ? f.label.slice(0, 47) + "…" : f.label;
    ctx.fillText(label, pad + 24, y + 10);
    ctx.fillStyle = "#4a8c6f";
    ctx.font = "600 22px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(`${f.minutesSaved} min`, CARD_W - pad - ctx.measureText(`${f.minutesSaved} min`).width, y + 10);
    y += 38;
  });
  y += 20;

  // Human rewards
  if (humanRewards.length > 0) {
    ctx.fillStyle = "rgba(74, 140, 111, 0.06)";
    const rewardH = 30 + humanRewards.length * 38;
    drawRoundedRect(ctx, pad, y, CARD_W - pad * 2, rewardH, 16);
    ctx.fill();
    y += 30;
    humanRewards.forEach((r) => {
      ctx.fillStyle = "#3a3530";
      ctx.font = "400 22px 'DM Sans', system-ui, sans-serif";
      ctx.fillText(`${r.emoji}  ${r.text}`, pad + 20, y + 6);
      y += 38;
    });
    y += 10;
  }

  // Footer
  y = CARD_H - pad;
  ctx.fillStyle = "#b0aaa4";
  ctx.font = "400 18px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("familyfoodOS.com", pad, y);
  ctx.fillStyle = "rgba(74, 140, 111, 0.15)";
  ctx.fillRect(pad, y - 30, CARD_W - pad * 2, 1);
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
