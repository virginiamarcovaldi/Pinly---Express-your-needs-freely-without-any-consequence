import { redirect } from "next/navigation";
import { getSession, defaultPathForRole } from "@/lib/auth";

export default async function BoardIndexPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(defaultPathForRole(session.role));
}
