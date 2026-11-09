import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";
import { AdminCreateForm } from "@/components/admin-create-form";

export default async function AdminTeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const [teams, unassignedInterns] = await Promise.all([
    prisma.team.findMany({ include: { members: { where: { leftAt: null }, include: { intern: { select: { name: true } } } } }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: UserRole.INTERN, status: "ACTIVE", teamMemberships: { none: { leftAt: null } } }, select: { id: true, name: true, internCode: true } }),
  ]);
  return <><AdminCreateForm kind="team" interns={unassignedInterns}/><AdminRecords title="Team management" description="Organize interns into working teams." records={teams.map((team) => ({ id: team.id, primary: team.name, secondary: team.description ?? "No description", status: team.isActive ? "ACTIVE" : "INACTIVE", extra: `${team.members.length} active members` }))} emptyText="No teams have been created yet."/></>;
}
