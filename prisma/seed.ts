import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";
import { getOrCreateBoard } from "../lib/boards";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const school = await prisma.school.upsert({
    where: { domain: "lincoln.edu" },
    update: {},
    create: {
      name: "Lincoln High School",
      domain: "lincoln.edu",
    },
  });

  const classA = await prisma.schoolClass.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "3A" } },
    update: {},
    create: { name: "3A", schoolId: school.id },
  });

  const classB = await prisma.schoolClass.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "3B" } },
    update: {},
    create: { name: "3B", schoolId: school.id },
  });

  const classroomBoardA = await getOrCreateBoard(prisma, {
    schoolId: school.id,
    type: "CLASSROOM",
    classId: classA.id,
  });

  await getOrCreateBoard(prisma, { schoolId: school.id, type: "CLASSROOM", classId: classB.id });

  const schoolBoard = await getOrCreateBoard(prisma, { schoolId: school.id, type: "SCHOOL" });

  const wellbeingBoard = await getOrCreateBoard(prisma, { schoolId: school.id, type: "WELLBEING" });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@lincoln.edu" },
    update: {},
    create: {
      email: "teacher@lincoln.edu",
      passwordHash,
      role: "TEACHER",
      displayName: "Mr. Alan Reed",
      schoolId: school.id,
      classId: classA.id,
    },
  });

  const rep = await prisma.user.upsert({
    where: { email: "rep@lincoln.edu" },
    update: {},
    create: {
      email: "rep@lincoln.edu",
      passwordHash,
      role: "STUDENT_REP",
      displayName: "Jordan Blake (Student Rep)",
      schoolId: school.id,
    },
  });

  const counselor = await prisma.user.upsert({
    where: { email: "counselor@lincoln.edu" },
    update: {},
    create: {
      email: "counselor@lincoln.edu",
      passwordHash,
      role: "COUNSELOR",
      displayName: "Dr. Maya Torres",
      schoolId: school.id,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student1@lincoln.edu" },
    update: {},
    create: {
      email: "student1@lincoln.edu",
      passwordHash,
      role: "STUDENT",
      displayName: "Student One",
      schoolId: school.id,
      classId: classA.id,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@lincoln.edu" },
    update: {},
    create: {
      email: "student2@lincoln.edu",
      passwordHash,
      role: "STUDENT",
      displayName: "Student Two",
      schoolId: school.id,
      classId: classA.id,
    },
  });

  // Sample pinned notes so the boards aren't empty on first login.
  const existingNotes = await prisma.note.count({ where: { boardId: classroomBoardA.id } });
  if (existingNotes === 0) {
    const note1 = await prisma.note.create({
      data: {
        boardId: classroomBoardA.id,
        authorId: student1.id,
        color: "YELLOW",
        text: "The math test was unfair, there wasn't enough time to finish it.",
      },
    });
    await prisma.reply.create({
      data: {
        noteId: note1.id,
        authorId: teacher.id,
        text: "Thanks for flagging this — I'll add 10 extra minutes next time and review the pacing.",
      },
    });
    await prisma.reply.create({
      data: {
        noteId: note1.id,
        authorId: student1.id,
        text: "That would really help, thank you for listening!",
      },
    });

    await prisma.note.create({
      data: {
        boardId: classroomBoardA.id,
        authorId: student2.id,
        color: "BLUE",
        text: "I'm anxious before every class, can we start with something calmer?",
      },
    });

    const schoolNote = await prisma.note.create({
      data: {
        boardId: schoolBoard.id,
        authorId: student1.id,
        color: "PINK",
        text: "We need a quieter break room, the current one is way too loud.",
      },
    });
    await prisma.reply.create({
      data: {
        noteId: schoolNote.id,
        authorId: rep.id,
        text: "Bringing this to the next student council meeting, thank you!",
      },
    });

    const wellbeingNote = await prisma.note.create({
      data: {
        boardId: wellbeingBoard.id,
        authorId: student2.id,
        color: "GREEN",
        text: "I've been feeling really overwhelmed lately and don't know who to talk to.",
      },
    });
    await prisma.reply.create({
      data: {
        noteId: wellbeingNote.id,
        authorId: counselor.id,
        text: "I'm glad you shared this. Would you like to stop by my office this week, no pressure?",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo school:", school.name, `(${school.domain})`);
  console.log("Demo password for every account:", DEMO_PASSWORD);
  console.log("Accounts:");
  console.log("  teacher@lincoln.edu    -> Teacher, Class 3A (Classroom Board)");
  console.log("  rep@lincoln.edu        -> Student Rep (School Board)");
  console.log("  counselor@lincoln.edu  -> Counselor (Wellbeing Board)");
  console.log("  student1@lincoln.edu   -> Student, Class 3A");
  console.log("  student2@lincoln.edu   -> Student, Class 3A");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
