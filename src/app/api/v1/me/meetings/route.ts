import { NextResponse } from "next/server";
import { MeetingStatus, UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.role !== UserRole.INTERN) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const meetings = await prisma.meeting.findMany({
    where: { participants: { some: { internId: session.userId } } },
    include: {
      team: { select: { id: true, name: true } },
      attendance: { where: { internId: session.userId }, select: { status: true, markedAt: true } },
    },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json({
    upcoming: meetings.filter((meeting) => meeting.status === MeetingStatus.SCHEDULED && meeting.startsAt >= new Date()),
    history: meetings.filter((meeting) => meeting.status !== MeetingStatus.SCHEDULED || meeting.startsAt < new Date()),
  });
}
