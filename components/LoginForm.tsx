"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { identifyEmail, login, signup } from "@/app/login/actions";
import type { Role } from "@/lib/generated/prisma/client";

type Step = "email" | "password" | "signup";

const ROLE_OPTIONS: { value: Role; label: string; needsClass: boolean }[] = [
  { value: "STUDENT", label: "Student", needsClass: true },
  { value: "TEACHER", label: "Teacher", needsClass: true },
  { value: "STUDENT_REP", label: "Student representative", needsClass: false },
  { value: "COUNSELOR", label: "School counselor", needsClass: false },
];

export function LoginForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [className, setClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [existingClasses, setExistingClasses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsClass = ROLE_OPTIONS.find((r) => r.value === role)?.needsClass ?? false;

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await identifyEmail(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.exists) {
        setStep("password");
      } else {
        setSchoolName(result.schoolName);
        setExistingClasses(result.existingClasses);
        setStep("signup");
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await login(email, password);
      if (!result.ok) setError(result.error);
    });
  }

  function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await signup({ email, password, displayName, role, className });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="text-2xl font-serif italic font-bold text-brand-orange">
        Pinly<span className="text-brand-navy">.</span>
      </Link>

      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
          <h1 className="text-lg font-semibold text-brand-navy">Log in with your school email</h1>
          <p className="text-sm text-slate-500">
            Use your school&apos;s email (real or a placeholder for this demo). We&apos;ll route you to
            the right board.
          </p>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              School email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourschool.edu"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand-orange text-white font-medium py-2.5 hover:bg-brand-orange-dark transition-colors disabled:opacity-60"
          >
            {isPending ? "Checking…" : "Continue"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
          <h1 className="text-lg font-semibold text-brand-navy">Welcome back</h1>
          <p className="text-sm text-slate-500">
            Signing in as <span className="font-medium text-brand-navy">{email}</span>
          </p>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Any password works in this demo"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand-orange text-white font-medium py-2.5 hover:bg-brand-orange-dark transition-colors disabled:opacity-60"
          >
            {isPending ? "Logging in…" : "Log in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="w-full text-sm text-slate-500 hover:text-brand-navy"
          >
            ← Use a different email
          </button>
        </form>
      )}

      {step === "signup" && (
        <form onSubmit={handleSignupSubmit} className="mt-8 space-y-4">
          <h1 className="text-lg font-semibold text-brand-navy">Create your account</h1>
          <p className="text-sm text-slate-500">
            First time we&apos;ve seen <span className="font-medium text-brand-navy">{email}</span> —
            joining <span className="font-medium text-brand-navy">{schoolName}</span>.
          </p>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="displayName">
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              required
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Only ever shown to school staff, never to other students"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="role">
              I am a…
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {needsClass && (
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="className">
                Class
              </label>
              <input
                id="className"
                type="text"
                required
                list="existing-classes"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 3A"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <datalist id="existing-classes">
                {existingClasses.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="signupPassword">
              Choose a password
            </label>
            <input
              id="signupPassword"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Any password works in this demo"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand-orange text-white font-medium py-2.5 hover:bg-brand-orange-dark transition-colors disabled:opacity-60"
          >
            {isPending ? "Creating account…" : "Create account & continue"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="w-full text-sm text-slate-500 hover:text-brand-navy"
          >
            ← Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
