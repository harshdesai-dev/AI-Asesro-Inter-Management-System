import { NextResponse } from "next/server";
import { AttendanceStatus, TaskStatus, UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalInterns, tasksAssigned, todayAttendance, meetingsThisMonth] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.INTERN, status: "ACTIVE" } }),
    prisma.task.count({ where: { status: { in: [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS, TaskStatus.SUBMITTED, TaskStatus.REVIEWED] } } }),
    prisma.attendance.findMany({ where: { workDate: startOfDay }, select: { status: true } }),
    prisma.meeting.count({ where: { startsAt: { gte: startOfMonth, lt: startOfNextMonth }, status: { not: "CANCELLED" } } }),
  ]);

  const presentCount = todayAttendance.filter((record) => record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE).length;
  const attendanceRate = todayAttendance.length
    ? Math.round((presentCount / totalInterns) * 100)
    : null;

  return NextResponse.json({
    stats: {
      totalInterns,
      tasksAssigned,
      attendanceRate,
      meetingsThisMonth,
      attendanceMarked: todayAttendance.length,
    },
  });
}
