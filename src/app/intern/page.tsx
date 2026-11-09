import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InternDashboard } from "@/components/intern-dashboard";

export default async function InternPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.INTERN) redirect("/");

  const [user, memberships, attendanceCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, internCode: true, position: true } }),
    prisma.teamMember.findMany({ where: { internId: session.userId, leftAt: null }, select: { teamId: true } }),
    prisma.attendance.count({ where: { internId: session.userId, status: "PRESENT" } }),
  ]);
  const teamIds = memberships.map((membership) => membership.teamId);
  const [assignments, upcoming] = await Promise.all([
    prisma.taskAssignment.findMany({
      where: { OR: [{ internId: session.userId }, ...(teamIds.length ? [{ teamId: { in: teamIds } }] : [])] },
      include: { task: { select: { id: true, title: true, deadline: true, status: true } } },
      orderBy: { assignedAt: "desc" },
      take: 6,
    }),
    prisma.meeting.findMany({
      where: { participants: { some: { internId: session.userId } }, status: "SCHEDULED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
      select: { id: true, title: true, startsAt: true, endsAt: true, meetingUrl: true },
    }),
  ]);

  return <InternDashboard name={user?.name ?? "Intern"} internCode={user?.internCode ?? "Intern"} position={user?.position ?? "Intern"} attendanceCount={attendanceCount} tasks={assignments.map((item) => item.task)} meetings={upcoming} />;
}
