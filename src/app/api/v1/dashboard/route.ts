import { NextResponse } from "next/server";
import { AttendanceStatus, TaskStatus, UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const activitySince = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalInterns, tasksAssigned, todayAttendance, meetingsThisMonth, submissions, attendanceChanges, upcomingMeetings] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.INTERN, status: "ACTIVE" } }),
    prisma.task.count({ where: { status: { in: [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.SUBMITTED, TaskStatus.REVIEWED] } } }),
    prisma.attendance.findMany({ where: { workDate: startOfDay }, select: { status: true } }),
    prisma.meeting.count({ where: { startsAt: { gte: startOfMonth, lt: startOfNextMonth }, status: { not: "CANCELLED" } } }),
    prisma.taskSubmission.findMany({
      where: { submittedAt: { gte: activitySince } },
      include: { submittedBy: { select: { name: true } }, assignment: { include: { task: { select: { title: true } } } } },
      orderBy: { submittedAt: "desc" }, take: 5,
    }),
    prisma.attendance.findMany({
      where: { markedAt: { gte: activitySince } },
      include: { intern: { select: { name: true } } },
      orderBy: { markedAt: "desc" }, take: 5,
    }),
    prisma.meeting.findMany({
      where: { startsAt: { gte: now }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" }, take: 3,
      include: { _count: { select: { participants: true } }, team: { select: { name: true } } },
    }),
  ]);

  const presentCount = todayAttendance.filter((record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE).length;
  const attendanceRate = todayAttendance.length && totalInterns
    ? Math.round((presentCount / totalInterns) * 100)
    : null;

  const activities = [
    ...submissions.map((submission) => ({
      id: `submission-${submission.id}`,
      title: "Task submission received",
      detail: `${submission.assignment.task.title} · ${submission.submittedBy.name}`,
      time: submission.submittedAt.toISOString(),
      tone: "purple",
      kind: "submission",
    })),
    ...attendanceChanges.map((record) => ({
      id: `attendance-${record.id}`,
      title: "Attendance marked",
      detail: `${record.intern.name} · ${record.status.replaceAll("_", " ")}`,
      time: record.markedAt.toISOString(),
      tone: "teal",
      kind: "attendance",
    })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  return NextResponse.json({
    stats: { totalInterns, tasksAssigned, attendanceRate, meetingsThisMonth, attendanceMarked: todayAttendance.length },
    activities,
    upcomingMeetings: upcomingMeetings.map((meeting) => ({
      id: meeting.id,
      day: meeting.startsAt.getDate().toString().padStart(2, "0"),
      month: meeting.startsAt.toLocaleString("en-IN", { month: "short" }).toUpperCase(),
      title: meeting.title,
      detail: `${meeting.startsAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} – ${meeting.endsAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
      people: meeting.team?.name ?? `${meeting._count.participants} participants`,
    })),
  });
}
