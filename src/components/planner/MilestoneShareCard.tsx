import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MilestoneShareData {
  /** Big headline number, e.g. 7 */
  value: string;
  /** What the number means, e.g. "nights in a row" */
  unit: string;
  /** The celebratory line under the number. */
  headline: string;
  /** Small supporting line. */
  subline: string;
  /** Level title, shown as a footer chip. */
  levelTitle: string;
  householdName?: string;
}

type AspectFormat = "square" | "story";

const FORMATS: { key: AspectFormat; label: string; sub: string; w: number; h: number }[] = [
  { key: "square", label: "Square", sub: "1:1", w: 1080, h: 1080 },
  { key: "story", label: "Story", sub: "9:16", w: 1080, h: 1920 },
];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderCard(canvas: HTMLCanvasElement, data: MilestoneShareData, format: AspectFormat) {
  const fmt = FORMATS.find((f) => f.key === format)!;
  const W = fmt.w;
  const H = fmt.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const cx = W / 2;
  const scale = format === "story" ? 1.15 : 1;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#F6F4EF");
  bg.addColorStop(1, "#EDEAE3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glowY = format === "story" ? H * 0.32 : H * 0.4;
  const glow = ctx.createRadialGradient(cx, glowY, 0, cx, glowY, 420);
  glow.addColorStop(0, "rgba(216, 138, 74, 0.16)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";

  const topY = format === "story" ? H * 0.22 : 150;

  ctx.fillStyle = "#6B6F6A";
  ctx.font = `500 ${Math.round(16 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.letterSpacing = "4px";
  ctx.fillText("MILESTONE UNLOCKED", cx, topY);
  ctx.letterSpacing = "0px";

  // Big number badge
  const badgeR = 170 * scale;
  const badgeY = topY + badgeR + 60 * scale;
  const ring = ctx.createLinearGradient(cx - badgeR, badgeY - badgeR, cx + badgeR, badgeY + badgeR);
  ring.addColorStop(0, "#2F4F3E");
  ring.addColorStop(1, "#D88A4A");
  ctx.beginPath();
  ctx.arc(cx, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = ring;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, badgeY, badgeR - 12 * scale, 0, Math.PI * 2);
  ctx.fillStyle = "#F6F4EF";
  ctx.fill();

  ctx.fillStyle = "#2F4F3E";
  ctx.font = `700 ${Math.round(120 * scale)}px 'Fraunces', Georgia, serif`;
  ctx.fillText(data.value, cx, badgeY + 30 * scale);
  ctx.fillStyle = "#6B6F6A";
  ctx.font = `500 ${Math.round(22 * scale)}px 'DM Sans', system-ui, sans-serif`;
  ctx.fillText(data.unit, cx, badgeY + 80 * scale);

  // Headline
  let y = badgeY + badgeR + 90 * scale;
  ctx.fillStyle = "#1F1F1F";
  ctx.font = `600 ${Math.round(52 * scale)}px 'Fraunces', Georgia, serif`;
  for (const line of wrap(ctx, data.headline, W - 180)) {
    ctx.fillText(line, cx, y);
    y += 62 * scale;
  }

  ctx.fillStyle = "#6B6F6A";
  ctx.font = `400 ${Math.round(26 * scale)}px 'DM Sans', system-ui, sans-serif`;
  y += 12 * scale;
  for (const line of wrap(ctx, data.subline, W - 240)) {
    ctx.fillText(line, cx, y);
    y += 38 * scale;
  }

  // Level chip
  const chipText = data.levelTitle;
  ctx.font = `600 ${Math.round(24 * scale)}px 'DM Sans', system-ui, sans-serif`;
  const chipW = ctx.measureText(chipText).width + 60;
  const chipH = 64 * scale;
  const chipY = y + 30 * scale;
  ctx.fillStyle = "rgba(47, 79, 62, 0.08)";
  roundRect(ctx, cx - chipW / 2, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.fillStyle = "#2F4F3E";
  ctx.fillText(chipText, cx, chipY + chipH / 2 + 9 * scale);

  // Footer
  ctx.fillStyle = "#9A9A94";
  ctx.font = `500 ${Math.round(20 * scale)}px 'DM Sans', system-ui, sans-serif`;
  const footer = data.householdName ? `${data.householdName} · Family Food OS` : "Family Food OS";
  ctx.fillText(footer, cx, H - (format === "story" ? 150 : 90));
}

interface Props {
  data: MilestoneShareData;
  /** Optional trigger label override. */
  label?: string;
}

/**
 * Screenshot-worthy milestone card. Rendered on a canvas so it can be
 * downloaded or shared through the native share sheet.
 */
const MilestoneShareCard = ({ data, label = "Share this win" }: Props) => {
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
        renderCard(canvas, data, fmt);
        setPreviewUrl(canvas.toDataURL("image/png"));
      }, 50);
    },
    [data],
  );

  const generate = () => {
    setOpen(true);
    renderCurrent(format);
  };

  const switchFormat = (fmt: AspectFormat) => {
    setFormat(fmt);
    setPreviewUrl(null);
    renderCurrent(fmt);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `family-food-os-milestone.png`;
    a.click();
    toast({ title: "Saved to your device", description: "Share it wherever you like." });
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not generate image");
      const file = new File([blob], "family-food-os-milestone.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Family Food OS",
          text: `${data.headline} — ${data.subline}`,
          files: [file],
        });
      } else {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          toast({ title: "Image copied to clipboard!", description: "Paste it into your favourite app." });
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
      <Button variant="ghost" size="sm" onClick={generate} className="text-xs gap-1.5 text-primary hover:text-primary">
        <ImageIcon className="w-3.5 h-3.5" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Your milestone card</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1.5 p-1 rounded-lg bg-muted/50 w-full">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => switchFormat(f.key)}
                  className={`flex-1 text-center py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    format === f.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
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
                alt="Milestone card"
                className={`w-full rounded-lg border border-border shadow-sm ${
                  format === "story" ? "max-h-[420px] w-auto" : ""
                }`}
              />
            )}
            <div className="flex gap-3 w-full">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilestoneShareCard;
