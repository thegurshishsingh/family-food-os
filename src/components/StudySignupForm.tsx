import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const HOUSEHOLD_TYPES = [
  "Couple, no kids",
  "Family with young kids",
  "Family with teens",
  "Multi-generational household",
  "Single adult",
  "Other",
];

// Spam-protection tuning
const COOLDOWN_KEY = "rwp_signup_last_submit";
const COOLDOWN_MS = 60 * 1000; // one submission per minute per browser
const MIN_FILL_MS = 2500; // forms completed faster than this are likely bots

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(4, "Please enter a valid email")
    .max(255, "Email must be under 255 characters")
    .email("Please enter a valid email"),
  householdType: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to participate to continue" }),
  }),
});

const StudySignupForm = () => {
  const [email, setEmail] = useState("");
  const [householdType, setHouseholdType] = useState<string>("");
  const [consent, setConsent] = useState(false);
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

    const result = signupSchema.safeParse({ email, householdType, consent });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("study_signups").insert({
      email: result.data.email,
      household_type: householdType || null,
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
        className="rounded-2xl border border-primary/20 bg-card/70 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
          You're on the list
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for contributing to The Real Week Project. We'll be in touch as the study grows.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-border/60 bg-card/70 p-6 md:p-8 text-left"
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

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="study-email">Email</Label>
          <Input
            id="study-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study-household">Household type (optional)</Label>
          <Select value={householdType} onValueChange={setHouseholdType}>
            <SelectTrigger id="study-household">
              <SelectValue placeholder="Select your household type" />
            </SelectTrigger>
            <SelectContent>
              {HOUSEHOLD_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="study-consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="study-consent"
            className="text-sm font-normal leading-relaxed text-muted-foreground"
          >
            I agree to participate in The Real Week Project and to be contacted about the study. My
            data is never sold.
          </Label>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-sage-dark shadow-md hover:from-primary/90 hover:to-sage-dark/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…
            </>
          ) : (
            <>
              Join the study <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default StudySignupForm;
