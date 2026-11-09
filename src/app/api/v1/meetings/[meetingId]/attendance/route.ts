import { NextResponse } from "next/server";
import { MeetingAttendanceStatus, MeetingStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const attendanceSchema = z.object({
  records: z.array(z.object({
    internId: z.string().cuid(),
    status: z.nativeEnum(MeetingAttendanceStatus),
  })).min(1).max(300),
});

export async function PUT(request: Request, context: { params: Promise<{ meetingId: string }> }) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { meetingId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = attendanceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid meeting attendance.", details: parsed.error.flatten() }, { status: 400 });

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { participants: { select: { internId: true } } },
  });
  if (!meeting) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  if (meeting.status === MeetingStatus.CANCELLED) return NextResponse.json({ error: "Cancelled meetings cannot have attendance." }, { status: 409 });

  const participantIds = new Set(meeting.participants.map((participant) => participant.internId));
  const records = parsed.data.records;
  if (new Set(records.map((record) => record.internId)).size !== records.length ||
      records.some((record) => !participantIds.has(record.internId))) {
    return NextResponse.json({ error: "Attendance can only be marked once for a meeting participant." }, { status: 400 });
  }

  const saved = await prisma.$transaction(records.map((record) => prisma.meetingAttendance.upsert({
    where: { meetingId_internId: { meetingId, internId: record.internId } },
    create: { meetingId, internId: record.internId, status: record.status, markedById: session.userId },
    update: { status: record.status, markedById: session.userId },
  })));
  return NextResponse.json({ records: saved });
}
