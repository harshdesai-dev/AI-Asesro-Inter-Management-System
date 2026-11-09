import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InternRecords } from "@/components/intern-records";

export default async function MyMeetingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.INTERN) redirect("/");
  const meetings = await prisma.meeting.findMany({
    where: { participants: { some: { internId: session.userId } } },
    include: { attendance: { where: { internId: session.userId } } },
    orderBy: { startsAt: "desc" },
    take: 100,
  });
  return <InternRecords kind="meetings" title="My meetings" description="Meetings you have been invited to and your meeting attendance." items={meetings.map((m) => ({ id: m.id, title: m.title, detail: `${m.startsAt.toLocaleString("en-IN")} · ${m.meetingUrl ? "Meeting link available" : "No meeting link"}`, status: m.status === "CANCELLED" ? "CANCELLED" : m.attendance[0]?.status ?? "NOT_MARKED" }))} />;
}
