import { NextResponse } from "next/server";
import { MeetingStatus, MeetingType, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  type: z.nativeEnum(MeetingType).optional(),
  status: z.nativeEnum(MeetingStatus).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  meetingUrl: z.string().url().max(2048).nullable().optional(),
  teamId: z.string().cuid().nullable().optional(),
  participantIds: z.array(z.string().cuid()).min(1).max(300).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ meetingId: string }> }) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { meetingId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid meeting update.", details: parsed.error.flatten() }, { status: 400 });

  const current = await prisma.meeting.findUnique({ where: { id: meetingId }, select: { id: true, startsAt: true, endsAt: true, status: true } });
  if (!current) return NextResponse.json({ error: "Meeting not found." }, { status: 404 });

  const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : current.startsAt;
  const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : current.endsAt;
  if (endsAt <= startsAt) return NextResponse.json({ error: "Meeting end time must be after its start time." }, { status: 400 });
  if (current.status === MeetingStatus.CANCELLED && parsed.data.status !== MeetingStatus.SCHEDULED) {
    return NextResponse.json({ error: "Cancelled meetings must be explicitly rescheduled before editing." }, { status: 409 });
  }

  const participantIds = parsed.data.participantIds ? [...new Set(parsed.data.participantIds)] : null;
  if (participantIds) {
    const count = await prisma.user.count({ where: { id: { in: participantIds }, role: UserRole.INTERN, status: "ACTIVE" } });
    if (count !== participantIds.length) return NextResponse.json({ error: "One or more participants are invalid or inactive." }, { status: 400 });
  }

  const meeting = await prisma.$transaction(async (tx) => {
    if (participantIds) {
      await tx.meetingParticipant.deleteMany({ where: { meetingId } });
      await tx.meetingParticipant.createMany({ data: participantIds.map((internId) => ({ meetingId, internId })) });
    }
    return tx.meeting.update({
      where: { id: meetingId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        status: parsed.data.status,
        startsAt,
        endsAt,
        meetingUrl: parsed.data.meetingUrl,
        teamId: parsed.data.teamId,
      },
      include: { participants: { include: { intern: { select: { id: true, name: true } } } } },
    });
  });
  return NextResponse.json({ meeting });
}
