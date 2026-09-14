import Link from "next/link";
import { Postit } from "@/components/Postit";

const HERO_NOTES: { color: "YELLOW" | "BLUE" | "PINK" | "GREEN"; text: string; time: string; rotation: string }[] = [
  { color: "YELLOW", text: "The math test was unfair.", time: "3m", rotation: "-rotate-3" },
  { color: "BLUE", text: "I'm anxious before every class.", time: "12m", rotation: "rotate-2" },
  { color: "PINK", text: "Can we redo Monday's lesson?", time: "41m", rotation: "-rotate-1" },
  { color: "GREEN", text: "Thank you, Prof. Ross!", time: "52m", rotation: "rotate-3" },
];

const BOARDS = [
  {
    title: "Classroom Board",
    audience: "→ teachers",
    color: "bg-sky-500",
    description: "Quick feedback on lessons, pace, and assignments — straight to the teacher.",
  },
  {
    title: "School Board",
    audience: "→ student reps",
    color: "bg-brand-navy",
    description: "Ideas and issues about school life, routed to the student representatives.",
  },
  {
    title: "Wellbeing Board",
    audience: "→ counselor",
    color: "bg-brand-orange",
    description: "A safe, anonymous space to reach the school counselor when it matters most.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-2xl font-serif italic font-bold text-brand-orange">
          Pinly<span className="text-brand-navy">.</span>
        </span>
        <Link
          href="/login"
          className="rounded-full bg-brand-navy text-white text-sm font-medium px-5 py-2 hover:bg-brand-navy-light transition-colors"
        >
          Log in
        </Link>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-serif italic text-4xl md:text-6xl font-bold text-brand-navy leading-tight">
              Pinly<span className="text-brand-orange">.</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl font-serif italic text-brand-navy/80">
              Express your needs freely, without any consequence.
            </p>
            <p className="mt-6 text-slate-600 max-w-md">
              An anonymous digital pinboard for schools. Students pin a post-it — a worry, an
              idea, a small good thing — and the right person reads it and can reply. Your school
              sees the pattern, never your name.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-brand-orange text-white font-medium px-6 py-3 hover:bg-brand-orange-dark transition-colors"
              >
                Get started
              </Link>
              <a
                href="#boards"
                className="rounded-full border border-brand-navy/20 text-brand-navy font-medium px-6 py-3 hover:bg-brand-navy/5 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="relative bg-[#e9e2d3] rounded-2xl p-8 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE BOARD
            </div>
            <div className="grid grid-cols-2 gap-4">
              {HERO_NOTES.map((note) => (
                <Postit key={note.text} color={note.color} rotation={note.rotation} className="min-h-28">
                  <p className="text-sm font-medium text-slate-800">{note.text}</p>
                  <p className="text-[11px] text-slate-500 mt-3">ANON · {note.time}</p>
                </Postit>
              ))}
            </div>
            <p className="text-right text-xs text-slate-500 mt-4">42 pinned today</p>
          </div>
        </section>

        <section id="boards" className="bg-white/60 border-y border-brand-navy/10">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">One anonymous voice, three audiences.</h2>
            <p className="text-slate-600 mb-10 max-w-2xl">
              Open a link. Pin a post-it. Done. Every board reaches exactly the person who can act
              on it.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {BOARDS.map((board) => (
                <div key={board.title} className="rounded-xl border border-brand-navy/10 bg-white p-6 shadow-sm">
                  <span className={`inline-block h-2 w-10 rounded-full ${board.color} mb-4`} />
                  <h3 className="font-semibold text-brand-navy text-lg">{board.title}</h3>
                  <p className="text-sm text-brand-orange font-medium mb-3">{board.audience}</p>
                  <p className="text-sm text-slate-600">{board.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-brand-navy">Ready to give your students a voice?</h2>
          <p className="text-slate-600 mt-2 mb-8">Log in with your school email to reach your board.</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-brand-navy text-white font-medium px-8 py-3 hover:bg-brand-navy-light transition-colors"
          >
            Log in to Pinly
          </Link>
        </section>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col sm:flex-row gap-2 justify-between text-sm text-slate-500 border-t border-brand-navy/10">
        <span>Pinly — Express your needs freely, without any consequence.</span>
        <span>info@pinly.it</span>
      </footer>
    </div>
  );
}
