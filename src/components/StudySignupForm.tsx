import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const HOUSEHOLD_SIZES = [
  "Just me",
  "2 people",
  "3 people",
  "4 people",
  "5 people",
  "6+ people",
];

// Spam-protection tuning
const COOLDOWN_KEY = "rwp_signup_last_submit";
const COOLDOWN_MS = 60 * 1000; // one submission per minute per browser
const MIN_FILL_MS = 2500; // forms completed faster than this are likely bots

const signupSchema = z.object({
  name: z.string().trim().max(120, "Name must be under 120 characters").optional(),
  email: z
    .string()
    .trim()
    .min(4, "Please enter a valid email")
    .max(255, "Email must be under 255 characters")
    .email("Please enter a valid email"),
  householdSize: z.string().optional(),
});

const StudySignupForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [householdSize, setHouseholdSize] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  // Honeypot: real users never fill this hidden field
  const [honeypot, setHoneypot] = useState("");
  // Timing trap: when the form was first rendered
  const mountedAt = useRef<number>(Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot tripped — silently pretend success so bots don't learn.
    if (honeypot.trim() !== "") {
      setDone(true);
      return;
    }

    // Timing trap — submitted implausibly fast.
    if (Date.now() - mountedAt.current < MIN_FILL_MS) {
      toast.error("That was a little too fast — please try again.");
      return;
    }

    // Client-side cooldown to curb rapid repeat submissions.
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (last && Date.now() - last < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
      toast.error(`Please wait ${secs}s before submitting again.`);
      return;
    }

    const result = signupSchema.safeParse({ name, email, householdSize });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("study_signups").insert({
      name: result.data.name || null,
      email: result.data.email,
      household_type: householdSize || null,
      consent: true,
    });
    setSubmitting(false);

    if (error) {
      if (error.message?.includes("rate_limited")) {
        toast.error("This email was used recently. Please try again later.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    setDone(true);
    toast.success("You're in — thank you for joining the study!");
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm sm:p-8"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-sans text-xl font-bold tracking-tight text-foreground">
          You're on the list
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for joining The Real Week Project. We'll be in touch when the next study week opens.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-3xl border border-border/60 bg-card p-5 text-left shadow-sm sm:p-7 md:p-8"
    >
      {/* Honeypot field — hidden from real users, only bots fill it */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="rwp-website">Leave this field empty</label>
        <input
          id="rwp-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="study-name" className="text-sm font-semibold text-foreground">
            Your name
          </Label>
          <Input
            id="study-name"
            type="text"
            autoComplete="name"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="h-12 rounded-xl bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study-email" className="text-sm font-semibold text-foreground">
            Email
          </Label>
          <Input
            id="study-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@home.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            className="h-12 rounded-xl bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study-household" className="text-sm font-semibold text-foreground">
            Household size
          </Label>
          <Select value={householdSize} onValueChange={setHouseholdSize}>
            <SelectTrigger id="study-household" className="h-12 rounded-xl bg-muted/50">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {HOUSEHOLD_SIZES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…
            </>
          ) : (
            <>
              Find my Dinner Pattern <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No spam. No selling your data. Just your dinner report.
        </p>
      </div>
    </form>
  );
};

export default StudySignupForm;
