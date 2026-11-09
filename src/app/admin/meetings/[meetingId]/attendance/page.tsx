import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MeetingAttendanceForm } from "@/components/meeting-attendance-form";

export default async function MeetingAttendancePage({ params }: { params: Promise<{ meetingId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const { meetingId } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { participants: { include: { intern: { select: { id: true, name: true, internCode: true } } } }, attendance: true },
  });
  if (!meeting) notFound();
  const statusByIntern = new Map(meeting.attendance.map((record) => [record.internId, record.status]));
  const participants = meeting.participants.map((participant) => ({
    id: participant.intern.id,
    name: participant.intern.name,
    internCode: participant.intern.internCode,
    status: statusByIntern.get(participant.intern.id) as "PRESENT" | "ABSENT" | "LATE" | undefined ?? null,
  }));
  return <main className="records-screen">
    <header className="records-top"><Link href="/admin/meetings"><ArrowLeft size={16}/> Back to meetings</Link><span className="eyebrow">AI ASESRO INTERNHUB · ADMIN</span></header>
    <section className="records-content">
      <span className="eyebrow">MEETING ATTENDANCE</span><h1>{meeting.title}</h1>
      <p>{meeting.startsAt.toLocaleString("en-IN")} · {meeting.status}</p>
      <div className="records-panel"><MeetingAttendanceForm meetingId={meeting.id} participants={participants} cancelled={meeting.status === "CANCELLED"}/></div>
    </section>
  </main>;
}
