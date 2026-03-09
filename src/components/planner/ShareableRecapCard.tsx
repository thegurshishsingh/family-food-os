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
  bg.addColorStop(0, "#f7f5f1");
  bg.addColorStop(0.5, "#f2f0ec");
  bg.addColorStop(1, "#ece8e1");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Subtle decorative circles
  ctx.globalAlpha = 0.045;
  ctx.fillStyle = "#4a8c6f";
  ctx.beginPath(); ctx.arc(920, 100, 220, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(160, 940, 180, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  const pad = 88;
  let y = pad + 10;

  // App badge
  ctx.fillStyle = "rgba(74, 140, 111, 0.10)";
  drawRoundedRect(ctx, pad, y, 310, 42, 21);
  ctx.fill();
  ctx.fillStyle = "#4a8c6f";
  ctx.font = "600 18px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("✨ Family Food OS", pad + 18, y + 27);
  y += 72;

  // Headline
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "700 58px 'Fraunces', Georgia, serif";
  const headline = `We got ${formatHours(result.totalMinutesSaved)} back`;
  ctx.fillText(headline, pad, y);
  y += 70;
  ctx.fillText("last week.", pad, y);
  y += 40;

  // Subtitle
  ctx.fillStyle = "#7a7570";
  ctx.font = "400 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText(`from ${plannedNights} planned meals · ${householdName}`, pad, y);
  y += 52;

  // Divider
  ctx.fillStyle = "rgba(74, 140, 111, 0.15)";
  ctx.fillRect(pad, y, CARD_W - pad * 2, 1.5);
  y += 44;

  // KPI row
  const kpis = [
    { value: formatHours(result.totalMinutesSaved), label: "Saved this week" },
    { value: formatHours(cumulativeMinutes), label: `Total (${totalWeeks} wk${totalWeeks !== 1 ? "s" : ""})` },
    { value: `${plannedNights}`, label: "Meals planned" },
  ];
  const kpiGap = 14;
  const kpiW = (CARD_W - pad * 2 - kpiGap * 2) / 3;
  kpis.forEach((kpi, i) => {
    const kx = pad + i * (kpiW + kpiGap);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    drawRoundedRect(ctx, kx, y, kpiW, 100, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(74, 140, 111, 0.12)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, kx, y, kpiW, 100, 14);
    ctx.stroke();
    ctx.fillStyle = "#4a8c6f";
    ctx.font = "700 32px 'Fraunces', Georgia, serif";
    ctx.fillText(kpi.value, kx + 18, y + 44);
    ctx.fillStyle = "#8a8580";
    ctx.font = "500 16px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(kpi.label, kx + 18, y + 74);
  });
  y += 132;

  // Top factors heading
  ctx.fillStyle = "#1f1d1a";
  ctx.font = "600 20px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Where the time came from", pad, y);
  y += 36;

  const topFactors = result.factors.slice(0, 4);
  topFactors.forEach((f) => {
    ctx.fillStyle = "#4a8c6f";
    ctx.beginPath(); ctx.arc(pad + 7, y + 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a3530";
    ctx.font = "400 20px 'DM Sans', system-ui, sans-serif";
    const maxLabelW = CARD_W - pad * 2 - 120;
    let label = f.label;
    while (ctx.measureText(label).width > maxLabelW && label.length > 10) {
      label = label.slice(0, -4) + "…";
    }
    ctx.fillText(label, pad + 22, y + 10);
    ctx.fillStyle = "#4a8c6f";
    ctx.font = "600 20px 'DM Sans', system-ui, sans-serif";
    const minText = `${f.minutesSaved} min`;
    ctx.fillText(minText, CARD_W - pad - ctx.measureText(minText).width, y + 10);
    y += 34;
  });
  y += 24;

  // Human rewards
  if (humanRewards.length > 0) {
    ctx.fillStyle = "rgba(74, 140, 111, 0.05)";
    const rewardH = 28 + humanRewards.length * 36;
    drawRoundedRect(ctx, pad, y, CARD_W - pad * 2, rewardH, 14);
    ctx.fill();
    y += 28;
    humanRewards.forEach((r) => {
      ctx.fillStyle = "#3a3530";
      ctx.font = "400 20px 'DM Sans', system-ui, sans-serif";
      ctx.fillText(`${r.emoji}  ${r.text}`, pad + 20, y + 6);
      y += 36;
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
