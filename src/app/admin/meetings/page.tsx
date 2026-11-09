import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";
import { AdminCreateForm } from "@/components/admin-create-form";

export default async function AdminMeetingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const [meetings, interns, teams] = await Promise.all([
    prisma.meeting.findMany({ include: { _count: { select: { participants: true } }, team: { select: { name: true } } }, orderBy: { startsAt: "desc" } }),
    prisma.user.findMany({ where: { role: UserRole.INTERN, status: "ACTIVE" }, select: { id: true, name: true, internCode: true } }),
    prisma.team.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
  ]);
  return <><AdminCreateForm kind="meeting" interns={interns} teams={teams}/><AdminRecords title="Meeting management" description="Schedule meetings and manage participants and separate meeting attendance." records={meetings.map((meeting) => ({ id: meeting.id, primary: meeting.title, secondary: meeting.startsAt.toLocaleString("en-IN"), status: meeting.status, extra: `${meeting.type} · ${meeting.team?.name ?? `${meeting._count.participants} participants`}` }))} emptyText="No meetings have been scheduled yet."/></>;
}
