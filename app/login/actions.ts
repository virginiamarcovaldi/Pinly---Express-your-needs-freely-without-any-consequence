"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setSessionCookie, clearSessionCookie, defaultPathForRole } from "@/lib/auth";
import { getOrCreateBoard } from "@/lib/boards";
import type { Role } from "@/lib/generated/prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function deriveSchoolName(domain: string) {
  const label = domain.split(".")[0] ?? domain;
  const titled = label
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  return `${titled} School`;
}

export type IdentifyResult =
  | { ok: false; error: string }
  | { ok: true; exists: true }
  | { ok: true; exists: false; schoolName: string; existingClasses: string[] };

export async function identifyEmail(email: string): Promise<IdentifyResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: trimmed } });
  if (existingUser) {
    return { ok: true, exists: true };
  }

  const domain = trimmed.split("@")[1];
  const school = await prisma.school.findUnique({
    where: { domain },
    include: { classes: { orderBy: { name: "asc" } } },
  });

  return {
    ok: true,
    exists: false,
    schoolName: school?.name ?? deriveSchoolName(domain),
    existingClasses: school?.classes.map((c) => c.name) ?? [],
  };
}

export type ActionResult = { ok: false; error: string } | { ok: true };

export async function login(email: string, password: string): Promise<ActionResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed) || password.length === 0) {
    return { ok: false, error: "Enter your school email and a password." };
  }

  const user = await prisma.user.findUnique({ where: { email: trimmed } });
  if (!user) {
    return { ok: false, error: "No account found for that email yet — go back and sign up." };
  }

  // Demo-only auth: any non-empty password is accepted for an existing account.
  await setSessionCookie({
    uid: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    classId: user.classId,
  });

  redirect(defaultPathForRole(user.role));
}

export async function signup(input: {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  className: string;
}): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const className = input.className.trim();

  if (!EMAIL_RE.test(email) || input.password.length === 0) {
    return { ok: false, error: "Enter your school email and a password." };
  }
  if (!displayName) {
    return { ok: false, error: "Enter your name." };
  }
  const needsClass = input.role === "STUDENT" || input.role === "TEACHER";
  if (needsClass && !className) {
    return { ok: false, error: "Enter your class (e.g. 3A)." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Someone raced us to sign up — fall back to logging them in.
    await setSessionCookie({
      uid: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      schoolId: existingUser.schoolId,
      classId: existingUser.classId,
    });
    redirect(defaultPathForRole(existingUser.role));
  }

  const domain = email.split("@")[1];
  const school = await prisma.school.upsert({
    where: { domain },
    update: {},
    create: { domain, name: deriveSchoolName(domain) },
  });

  let classId: string | null = null;
  if (needsClass) {
    const schoolClass = await prisma.schoolClass.upsert({
      where: { schoolId_name: { schoolId: school.id, name: className } },
      update: {},
      create: { schoolId: school.id, name: className },
    });
    classId = schoolClass.id;
    await getOrCreateBoard(prisma, { schoolId: school.id, type: "CLASSROOM", classId });
  }
  await getOrCreateBoard(prisma, { schoolId: school.id, type: "SCHOOL" });
  await getOrCreateBoard(prisma, { schoolId: school.id, type: "WELLBEING" });

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: input.role,
      displayName,
      schoolId: school.id,
      classId,
    },
  });

  await setSessionCookie({
    uid: user.id,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    classId: user.classId,
  });

  redirect(defaultPathForRole(user.role));
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
