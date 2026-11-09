import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSession } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === UserRole.INTERN) redirect("/intern");
  return <DashboardShell />;
}
