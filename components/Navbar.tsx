"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import type { BoardSlug } from "@/lib/permissions";

const TAB_LABELS: Record<BoardSlug, string> = {
  classroom: "Classroom",
  school: "School",
  wellbeing: "Wellbeing",
};

export function Navbar({
  displayName,
  roleLabel,
  className,
  boardTabs,
}: {
  displayName: string;
  roleLabel: string;
  className?: string | null;
  boardTabs: BoardSlug[];
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-brand-navy/10 bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-serif italic font-bold text-brand-orange shrink-0">
            Pinly<span className="text-brand-navy">.</span>
          </Link>
          <nav className="flex items-center gap-1">
            {boardTabs.map((slug) => {
              const href = `/board/${slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={slug}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-brand-navy text-white" : "text-brand-navy/70 hover:bg-brand-navy/5"
                  }`}
                >
                  {TAB_LABELS[slug]}
                </Link>
              );
            })}
            <Link
              href="/my-board"
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/my-board"
                  ? "bg-brand-navy text-white"
                  : "text-brand-navy/70 hover:bg-brand-navy/5"
              }`}
            >
              My board
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <p className="font-medium text-brand-navy leading-tight">{displayName}</p>
            <p className="text-xs text-slate-500 leading-tight">
              {roleLabel}
              {className ? ` · ${className}` : ""}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-brand-navy/20 text-brand-navy text-sm font-medium px-4 py-1.5 hover:bg-brand-navy/5 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
