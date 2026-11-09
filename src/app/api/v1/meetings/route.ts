import { NextResponse } from "next/server";
import { MeetingStatus, MeetingType, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const meetingSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(5000).optional(),
  type: z.nativeEnum(MeetingType),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  meetingUrl: z.string().url().max(2048).optional().or(z.literal("")),
  teamId: z.string().cuid().optional(),
  participantIds: z.array(z.string().cuid()).min(1).max(300),
}).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
  message: "Meeting end time must be after its start time.", path: ["endsAt"],
});

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const meetings = await prisma.meeting.findMany({
    include: {
      team: { select: { id: true, name: true } },
      participants: { include: { intern: { select: { id: true, name: true, internCode: true } } } },
      attendance: true,
    },
    orderBy: { startsAt: "desc" },
  });
  return NextResponse.json({ meetings });
}

export async function POST(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = meetingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid meeting details.", details: parsed.error.flatten() }, { status: 400 });

  const participantIds = [...new Set(parsed.data.participantIds)];
  const count = await prisma.user.count({ where: { id: { in: participantIds }, role: UserRole.INTERN, status: "ACTIVE" } });
  if (count !== participantIds.length) return NextResponse.json({ error: "One or more participants are invalid or inactive." }, { status: 400 });

  if (parsed.data.teamId) {
    const team = await prisma.team.findUnique({ where: { id: parsed.data.teamId }, select: { isActive: true } });
    if (!team?.isActive) return NextResponse.json({ error: "Selected team is not active." }, { status: 400 });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      meetingUrl: parsed.data.meetingUrl || null,
      teamId: parsed.data.teamId || null,
      createdById: session.userId,
      status: MeetingStatus.SCHEDULED,
      participants: { create: participantIds.map((internId) => ({ internId })) },
    },
    include: { participants: { include: { intern: { select: { id: true, name: true, email: true } } } } },
  });
  return NextResponse.json({ meeting }, { status: 201 });
}
