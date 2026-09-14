import type { NoteColor } from "@/lib/generated/prisma/client";

const COLOR_CLASSES: Record<NoteColor, string> = {
  YELLOW: "bg-yellow-200 border-yellow-300",
  BLUE: "bg-sky-200 border-sky-300",
  PINK: "bg-pink-200 border-pink-300",
  GREEN: "bg-lime-200 border-lime-300",
  ORANGE: "bg-orange-200 border-orange-300",
};


// Fixed rotation set (not random) so server and client render the same markup.
const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

export function postitRotation(seed: number) {
  return ROTATIONS[seed % ROTATIONS.length];
}

export function Postit({
  color,
  rotation = "rotate-0",
  className = "",
  children,
}: {
  color: NoteColor;
  rotation?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${COLOR_CLASSES[color]} ${rotation} border shadow-lg rounded-sm p-4 flex flex-col justify-between transition-transform hover:rotate-0 hover:scale-[1.02] ${className}`}
    >
      <span
        aria-hidden
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-red-500 shadow-[0_1px_2px_rgba(0,0,0,0.4)] ring-2 ring-red-700/30"
      />
      {children}
    </div>
  );
}

export const NOTE_COLORS: NoteColor[] = ["YELLOW", "BLUE", "PINK", "GREEN", "ORANGE"];

export const NOTE_COLOR_SWATCH: Record<NoteColor, string> = {
  YELLOW: "bg-yellow-300",
  BLUE: "bg-sky-300",
  PINK: "bg-pink-300",
  GREEN: "bg-lime-300",
  ORANGE: "bg-orange-300",
};
