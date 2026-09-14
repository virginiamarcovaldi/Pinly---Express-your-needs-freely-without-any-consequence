"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNote } from "@/app/(app)/board/[type]/actions";
import { NOTE_COLORS, NOTE_COLOR_SWATCH } from "@/components/Postit";
import type { NoteColor } from "@/lib/generated/prisma/client";

const MAX_LENGTH = 500;

export function NewNoteForm({ boardSlug, audienceLabel }: { boardSlug: string; audienceLabel: string }) {
  const [color, setColor] = useState<NoteColor>("YELLOW");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createNote(boardSlug, color, text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-xl border border-brand-navy/10 bg-white p-5 shadow-sm mb-8"
    >
      <label htmlFor="note-text" className="text-sm font-medium text-brand-navy">
        Pin an anonymous post-it for {audienceLabel}
      </label>
      <textarea
        id="note-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Say what's on your mind. Nobody will know it's you."
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c.toLowerCase()}`}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full ${NOTE_COLOR_SWATCH[c]} border-2 transition-transform ${
                color === c ? "border-brand-navy scale-110" : "border-transparent"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {text.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isPending || text.trim().length === 0}
            className="rounded-full bg-brand-orange text-white text-sm font-medium px-5 py-2 hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
          >
            {isPending ? "Pinning…" : "Pin it"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
