import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { boardsForRole, roleLabel } from "@/lib/permissions";
import { getUnreadCount } from "@/lib/notifications";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    include: { schoolClass: true },
  });
  if (!user) redirect("/login");

  const boardTabs = boardsForRole(user.role);
  const unreadCount = await getUnreadCount(session);
  const unreadHref = user.role === "STUDENT" ? "/my-board" : `/board/${boardTabs[0]}`;

  return (
    <div className="flex-1 flex flex-col">
      <Navbar
        displayName={user.displayName}
        roleLabel={roleLabel(user.role)}
        className={user.schoolClass?.name ?? null}
        boardTabs={boardTabs}
        unreadCount={unreadCount}
        unreadHref={unreadHref}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
