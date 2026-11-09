import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.role !== UserRole.INTERN) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const memberships = await prisma.teamMember.findMany({
    where: { internId: session.userId, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map((membership) => membership.teamId);

  const assignments = await prisma.taskAssignment.findMany({
    where: { OR: [{ internId: session.userId }, ...(teamIds.length ? [{ teamId: { in: teamIds } }] : [])] },
    include: {
      task: { select: { id: true, title: true, description: true, status: true, deadline: true, createdAt: true } },
      team: { select: { id: true, name: true } },
      submissions: {
        where: { OR: [{ submittedForInternId: session.userId }, ...(teamIds.length ? [{ submittedForTeamId: { in: teamIds } }] : [])] },
        orderBy: { submittedAt: "desc" },
        take: 10,
        select: { id: true, submissionType: true, reviewStatus: true, submittedAt: true, content: true, referenceUrl: true },
      },
    },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json({ assignments });
}
