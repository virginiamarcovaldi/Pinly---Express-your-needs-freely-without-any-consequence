"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReply } from "@/app/(app)/board/[type]/actions";
import { Postit } from "@/components/Postit";
import type { NoteColor } from "@/lib/generated/prisma/client";

export type ReplyData = {
  id: string;
  text: string;
  timeLabel: string;
  label: string;
  isYou: boolean;
};

export type NoteCardData = {
  id: string;
  color: NoteColor;
  text: string;
  timeLabel: string;
  rotation: string;
  replies: ReplyData[];
  canReply: boolean;
};

const MAX_LENGTH = 500;

export function NoteCard({ note, boardSlug }: { note: NoteCardData; boardSlug: string }) {
  const [expanded, setExpanded] = useState(note.replies.length > 0);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createReply(boardSlug, note.id, replyText);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReplyText("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col">
      <Postit color={note.color} rotation={note.rotation} className="min-h-32">
        <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{note.text}</p>
        <p className="text-[11px] text-slate-500 mt-3">{note.timeLabel}</p>
      </Postit>

      {(note.replies.length > 0 || note.canReply) && (
        <div className="mt-1 px-1">
          {note.replies.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-brand-navy/70 hover:text-brand-navy underline"
            >
              {expanded ? "Hide" : "Show"} {note.replies.length}{" "}
              {note.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}

          {expanded && (
            <div className="mt-2 space-y-2">
              {note.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="text-xs bg-white/70 border border-brand-navy/10 rounded-lg px-3 py-2"
                >
                  <p className="font-medium text-brand-navy">
                    {reply.label} <span className="font-normal text-slate-400">· {reply.timeLabel}</span>
                  </p>
                  <p className="text-slate-700 mt-0.5 whitespace-pre-wrap break-words">{reply.text}</p>
                </div>
              ))}
            </div>
          )}

          {note.canReply && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={MAX_LENGTH}
                placeholder="Reply…"
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <button
                type="submit"
                disabled={isPending || replyText.trim().length === 0}
                className="rounded-full bg-brand-navy text-white text-xs font-medium px-3 py-1.5 hover:bg-brand-navy-light transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </form>
          )}
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
