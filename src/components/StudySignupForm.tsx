import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.error("Something went wrong. Please try again.");
      return;
    }
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
      className="rounded-2xl border border-border/60 bg-card/70 p-6 md:p-8 text-left"
    >
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
