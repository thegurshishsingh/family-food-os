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

type AspectFormat = "square" | "story" | "landscape";

const FORMATS: { key: AspectFormat; label: string; sub: string; w: number; h: number }[] = [
  { key: "square", label: "Square", sub: "1:1", w: 1080, h: 1080 },
  { key: "story", label: "Story", sub: "9:16", w: 1080, h: 1920 },
  { key: "landscape", label: "Twitter / X", sub: "16:9", w: 1920, h: 1080 },
];

function renderCard(
  canvas: HTMLCanvasElement,
  result: TimeSavedResult,
  cumulativeMinutes: number,
  humanRewards: HumanReward[],
  householdName: string,
  format: AspectFormat,
) {
  const fmt = FORMATS.find((f) => f.key === format)!;
  const W = fmt.w;
  const H = fmt.h;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;

  // ── Background ──
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#f8f6f2");
  bg.addColorStop(1, "#f0ede7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Radial glow
  const glowY = format === "story" ? H * 0.28 : H * 0.38;
  const glowR = format === "landscape" ? 420 : 360;
  const glow = ctx.createRadialGradient(cx, glowY, 0, cx, glowY, glowR);
  glow.addColorStop(0, "rgba(74, 140, 111, 0.06)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";

  // ── Adaptive layout params ──
  const scale = format === "landscape" ? 1.1 : format === "story" ? 1.15 : 1;
  const topY = format === "story" ? H * 0.2 : format === "landscape" ? H * 0.15 : 130;

  // ── TOP LABEL ──
  ctx.fillStyle = "#9a9590";
  ctx.font = `500 ${Math.round(16 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText("LAST WEEK RECAP", cx, topY);
  ctx.letterSpacing = "0px";

  // ── HERO NUMBER ──
  const heroY = topY + 120 * scale;
  ctx.fillStyle = "#4a8c6f";
  ctx.font = `700 ${Math.round(72 * scale)}px 'Fraunces', Georgia, serif`;
  ctx.fillText(formatHours(result.totalMinutesSaved), cx, heroY);

  ctx.fillStyle = "#1f1d1a";
  ctx.font = `600 ${Math.round(38 * scale)}px 'Fraunces', Georgia, serif`;
  ctx.fillText("back.", cx, heroY + 50 * scale);

  // ── SUPPORTING COPY ──
  const copyY = heroY + 110 * scale;
  ctx.fillStyle = "#9a9590";
  ctx.font = `400 ${Math.round(20 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText("From smarter planning, fewer scrambles,", cx, copyY);
  ctx.fillText("and a week that mostly ran itself.", cx, copyY + 28 * scale);

  // ── DIVIDER ──
  const divY = copyY + 65 * scale;
  const divPad = format === "landscape" ? W * 0.3 : W * 0.17;
  ctx.fillStyle = "rgba(74, 140, 111, 0.12)";
  ctx.fillRect(divPad, divY, W - divPad * 2, 1);

  // ── KPIs ──
  const kpiY = divY + 60 * scale;
  const kpiSpread = format === "landscape" ? 200 : 140;
  const kpiFontSize = Math.round(40 * scale);
  const kpiLabelSize = Math.round(16 * scale);

  ctx.fillStyle = "#1f1d1a";
  ctx.font = `700 ${kpiFontSize}px 'Fraunces', Georgia, serif`;
  ctx.fillText(formatHours(result.totalMinutesSaved), cx - kpiSpread, kpiY);
  ctx.fillStyle = "#9a9590";
  ctx.font = `400 ${kpiLabelSize}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText("this week", cx - kpiSpread, kpiY + 28 * scale);

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(cx, kpiY - 30, 1, 60);

  ctx.fillStyle = "#1f1d1a";
  ctx.font = `700 ${kpiFontSize}px 'Fraunces', Georgia, serif`;
  ctx.fillText(formatHours(cumulativeMinutes), cx + kpiSpread, kpiY);
  ctx.fillStyle = "#9a9590";
  ctx.font = `400 ${kpiLabelSize}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText("all time", cx + kpiSpread, kpiY + 28 * scale);

  // ── EMOTIONAL PAYOFF ──
  const rewardY = kpiY + 100 * scale;
  if (humanRewards.length > 0) {
    const reward = humanRewards[0];
    ctx.fillStyle = "#1f1d1a";
    ctx.font = `500 ${Math.round(26 * scale)}px 'Fraunces', Georgia, serif`;
    ctx.fillText(`${reward.emoji}  ${reward.text}`, cx, rewardY);
  }

  // ── HOUSEHOLD NAME ──
  ctx.fillStyle = "#b5b0a8";
  ctx.font = `400 ${Math.round(18 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText(householdName, cx, rewardY + 60 * scale);

  // ── FOOTER ──
  const footerDivY = H - 100;
  ctx.fillStyle = "rgba(74, 140, 111, 0.10)";
  ctx.fillRect(divPad, footerDivY, W - divPad * 2, 1);
  ctx.fillStyle = "#b5b0a8";
  ctx.font = `400 ${Math.round(16 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText("familyfoodOS.com", cx, H - 55);

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
  const [format, setFormat] = useState<AspectFormat>("square");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const renderCurrent = useCallback(
    (fmt: AspectFormat) => {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        renderCard(canvas, result, cumulativeMinutes, humanRewards, householdName, fmt);
        setPreviewUrl(canvas.toDataURL("image/png"));
      }, 50);
    },
    [result, cumulativeMinutes, humanRewards, householdName],
  );

  const generate = useCallback(() => {
    setOpen(true);
    renderCurrent(format);
  }, [format, renderCurrent]);

  const switchFormat = (fmt: AspectFormat) => {
    setFormat(fmt);
    setPreviewUrl(null);
    renderCurrent(fmt);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const fmtLabel = FORMATS.find((f) => f.key === format)!.sub.replace(":", "x");
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `family-food-os-recap-${fmtLabel}.png`;
    a.click();
    toast({ title: "Image downloaded!", description: "Share it on your favorite social platform." });
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not generate image");
      const fmtLabel = FORMATS.find((f) => f.key === format)!.sub.replace(":", "x");
      const file = new File([blob], `family-food-os-recap-${fmtLabel}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My Family Food OS Recap",
          text: `My family got ${formatHours(result.totalMinutesSaved)} back last week with Family Food OS!`,
          files: [file],
        });
      } else {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          toast({ title: "Image copied to clipboard!", description: "Paste it into your favorite app." });
        } catch {
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
            {/* Format picker */}
            <div className="flex gap-1.5 p-1 rounded-lg bg-muted/50 w-full">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => switchFormat(f.key)}
                  className={`flex-1 text-center py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    format === f.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="block">{f.label}</span>
                  <span className="block text-[10px] opacity-60">{f.sub}</span>
                </button>
              ))}
            </div>

            <canvas ref={canvasRef} className="hidden" />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Weekly recap card"
                className={`w-full rounded-lg border border-border shadow-sm ${
                  format === "story" ? "max-h-[420px] w-auto" : ""
                }`}
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
