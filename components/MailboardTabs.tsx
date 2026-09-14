"use client";

import { useState } from "react";
import { Postit } from "@/components/Postit";
import type { NoteColor } from "@/lib/generated/prisma/client";

export type MailboardItem = {
  id: string;
  color: NoteColor;
  text: string;
  timeLabel: string;
  boardLabel: string;
  meta: string;
  rotation: string;
};

function MailboardGrid({ items, emptyLabel }: { items: MailboardItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400 italic">{emptyLabel}</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-brand-navy/50">
            {item.boardLabel}
          </span>
          <Postit color={item.color} rotation={item.rotation} className="min-h-32">
            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{item.text}</p>
            <p className="text-[11px] text-slate-500 mt-3">{item.timeLabel}</p>
          </Postit>
          <p className="text-xs text-slate-500">{item.meta}</p>
        </div>
      ))}
    </div>
  );
}

export function MailboardTabs({
  received,
  sent,
}: {
  received: MailboardItem[];
  sent: MailboardItem[];
}) {
  const [tab, setTab] = useState<"received" | "sent">("received");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "received" ? "bg-brand-navy text-white" : "bg-white border border-brand-navy/10 text-brand-navy/70 hover:bg-brand-navy/5"
          }`}
        >
          Received ({received.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "sent" ? "bg-brand-navy text-white" : "bg-white border border-brand-navy/10 text-brand-navy/70 hover:bg-brand-navy/5"
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {tab === "received" ? (
        <MailboardGrid items={received} emptyLabel="Nothing received yet." />
      ) : (
        <MailboardGrid items={sent} emptyLabel="Nothing sent yet." />
      )}
    </div>
  );
}
