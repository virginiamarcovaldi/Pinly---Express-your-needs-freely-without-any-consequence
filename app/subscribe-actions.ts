"use server";

import { prisma } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeResult = { ok: true } | { ok: false; error: string };

/** Captures a "Get in touch to subscribe" lead from the pricing card. */
export async function subscribeLead(email: string): Promise<SubscribeResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  await prisma.lead.upsert({
    where: { email: trimmed },
    update: {},
    create: { email: trimmed },
  });

  return { ok: true };
}
