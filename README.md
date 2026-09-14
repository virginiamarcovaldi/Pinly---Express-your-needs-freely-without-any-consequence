# Pinly — Express your needs freely, without any consequence.

Pinly is an anonymous digital pinboard for schools. Students pin a post-it — a
worry, an idea, a small good thing — on one of three boards, and the right
person reads it and can reply. Nobody ever sees who wrote it.

This is the working app behind the Pinly pitch deck, built with
Next.js, Prisma and SQLite.

## The three boards

| Board | Students post to it | Staff who read & reply |
| --- | --- | --- |
| **Classroom Board** | their own class | the class **teacher** |
| **School Board** | the whole school | the **student representative** |
| **Wellbeing Board** | the whole school | the **school counselor** |

Every post-it is anonymous. A student only ever sees their **own** post-its
(never other students') plus the replies to them, all on their personal
["My board"](app/(app)/my-board/page.tsx) — the board pages themselves are
write-only for students (just the composer). Staff see every post-it
pinned to their board, always as "Anonymous", and can reply; a student can
reply back on their own note to continue that conversation. Everyone else
just sees "Anonymous" and the staff role that answered ("Teacher", "Student
Rep", "Counselor"). A red badge on the nav shows unread replies/post-its
since a user's last visit.

## Login

Pinly uses a **demo-only, simplified login**: enter any school email and any
password. New emails walk you through a one-time sign-up (name, role,
class), existing emails just log in — **passwords are never checked**, this
is intentionally not production-grade auth. See
[`app/login/actions.ts`](app/login/actions.ts).

Signing up with an email from a school domain that doesn't exist yet
automatically creates that school (and its three boards), so you can try
Pinly as a "new" school by using any email you like.

### Demo accounts (Lincoln High School, pre-seeded)

Password for all of them: `demo1234` (or literally anything).

| Role | Email |
| --- | --- |
| Student | `student1@lincoln.edu` / `student2@lincoln.edu` |
| Teacher (Class 3A) | `teacher@lincoln.edu` |
| Student Rep | `rep@lincoln.edu` |
| Counselor | `counselor@lincoln.edu` |

## Getting started

```bash
npm install
cp .env.example .env        # then set SESSION_SECRET to a random string
npx prisma generate         # generate the Prisma client (also runs on install)
npx prisma migrate deploy   # create the SQLite database
npx prisma db seed          # load the demo school + accounts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Newer npm versions (11+) may block install scripts** for security,
> printing `npm warn install-scripts` and skipping the automatic
> `prisma generate` + native `better-sqlite3` build. If `npm install` warns
> about this, either run `npx prisma generate` yourself (as above — this
> always works, it doesn't depend on install scripts) or approve the
> scripts as npm suggests (`npm install-scripts approve <pkg>` for each
> package it lists, then `npm install` again) so `better-sqlite3`'s native
> binding gets built too.

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Tech stack

- **Next.js 16** (App Router, Server Actions, Proxy for route protection)
- **Prisma 7** + **SQLite** (via the `better-sqlite3` driver adapter) for data
- **jose** for signed session cookies, **bcryptjs** for password hashing
- **Tailwind CSS 4** for styling

## Project structure

```
app/
  page.tsx                 marketing landing page
  login/                   login/sign-up UI + server actions
  (app)/                   authenticated shell (nav, logout)
    layout.tsx
    board/[type]/          composer for students, full reply feed for staff
    my-board/               a student's own post-its + replies, on a cork board
components/                 Postit, NoteCard, NewNoteForm, Navbar, LoginForm
lib/                        auth/session, permissions, Prisma client, helpers
prisma/                     schema, migrations, seed script
```

## Data model

`School` → `SchoolClass` (e.g. "3A") → `Board` (CLASSROOM/SCHOOL/WELLBEING) →
`Note` (a post-it) → `Reply`. Access rules live in
[`lib/permissions.ts`](lib/permissions.ts): who can view a board, who can
post to it, and who can reply to a given note.

A separate `Lead` model captures emails submitted through the landing
page's "Get in touch to subscribe" pricing card (see
[`app/subscribe-actions.ts`](app/subscribe-actions.ts)) — no email is sent
automatically, it's just saved for manual follow-up. View captured leads
with:

```bash
npx prisma studio
```

## Deploying

The app is a standard Next.js app; SQLite is fine for a demo/pilot but for a
real multi-school rollout swap the Prisma adapter for a hosted database
(Postgres, Turso, etc.) — everything else stays the same.
