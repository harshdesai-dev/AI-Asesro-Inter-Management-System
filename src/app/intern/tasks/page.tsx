import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InternRecords } from "@/components/intern-records";

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.INTERN) redirect("/");
  const memberships = await prisma.teamMember.findMany({ where: { internId: session.userId, leftAt: null }, select: { teamId: true } });
  const teamIds = memberships.map((item) => item.teamId);
  const assignments = await prisma.taskAssignment.findMany({
    where: { OR: [{ internId: session.userId }, ...(teamIds.length ? [{ teamId: { in: teamIds } }] : [])] },
    include: { task: { select: { id: true, title: true, description: true, deadline: true, status: true } }, team: { select: { name: true } } },
    orderBy: { assignedAt: "desc" },
  });
  return <InternRecords kind="tasks" title="My tasks" description="Assignments shared with you or your team." items={assignments.map((a) => ({ id: a.id, title: a.task.title, detail: `${a.team?.name ? `Team: ${a.team.name} · ` : ""}${a.task.deadline ? `Due ${a.task.deadline.toLocaleDateString("en-IN")}` : "No deadline"}`, status: a.task.status }))} />;
}
