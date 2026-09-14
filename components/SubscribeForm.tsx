"use client";

import { useState, useTransition } from "react";
import { subscribeLead } from "@/app/subscribe-actions";

type Step = "idle" | "form" | "success";

export function SubscribeForm() {
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await subscribeLead(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep("success");
    });
  }

  if (step === "success") {
    return (
      <div className="mt-8 rounded-xl bg-brand-orange/10 border border-brand-orange/20 p-5 text-center">
        <p className="text-sm font-semibold text-brand-navy">Thanks! We&apos;ve received your request.</p>
        <p className="text-sm text-slate-600 mt-1">
          We&apos;ll be in touch at <span className="font-medium text-brand-navy">{email}</span> soon
          with more information about Pinly.
        </p>
      </div>
    );
  }

  if (step === "form") {
    return (
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourschool.edu"
            className="flex-1 min-w-0 rounded-full border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-brand-orange text-white font-medium px-6 py-3 hover:bg-brand-orange-dark transition-colors disabled:opacity-60 shrink-0"
          >
            {isPending ? "Sending…" : "Send"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStep("form")}
      className="mt-8 block w-full text-center rounded-full bg-brand-orange text-white font-medium py-3 hover:bg-brand-orange-dark transition-colors"
    >
      Get in touch to subscribe
    </button>
  );
}
