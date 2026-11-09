import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";

export default async function AdminTeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const teams = await prisma.team.findMany({ include: { members: { where: { leftAt: null }, include: { intern: { select: { name: true } } } } }, orderBy: { name: "asc" } });
  return <AdminRecords title="Team management" description="Organize interns into working teams." records={teams.map((team) => ({ id: team.id, primary: team.name, secondary: team.description ?? "No description", status: team.isActive ? "ACTIVE" : "INACTIVE", extra: `${team.members.length} active members` }))} emptyText="No teams have been created yet." />;
}
