import { NextResponse } from "next/server";
import { AssignmentType, SubmissionType, UserRole } from "@prisma/client";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const submissionSchema = z.object({
  assignmentId: z.string().cuid(),
  submissionType: z.nativeEnum(SubmissionType),
  content: z.string().trim().max(10000).optional(),
  referenceUrl: z.string().url().max(2048).optional().or(z.literal("")),
}).refine((value) => Boolean(value.content || value.referenceUrl), {
  message: "Add a written update or a valid reference link.",
});

export async function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.role !== UserRole.INTERN) return NextResponse.json({ error: "Only interns can submit work." }, { status: 403 });

  const { taskId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid submission.", details: parsed.error.flatten() }, { status: 400 });

  const assignment = await prisma.taskAssignment.findFirst({
    where: { id: parsed.data.assignmentId, taskId },
    include: { task: true },
  });
  if (!assignment) return NextResponse.json({ error: "Task assignment not found." }, { status: 404 });

  let targetInternId: string | null = null;
  let targetTeamId: string | null = null;

  if (assignment.type === AssignmentType.INDIVIDUAL) {
    if (assignment.internId !== session.userId || parsed.data.submissionType !== SubmissionType.INDIVIDUAL) {
      return NextResponse.json({ error: "You cannot submit for this assignment." }, { status: 403 });
    }
    targetInternId = session.userId;
  } else {
    if (!assignment.teamId) return NextResponse.json({ error: "Team assignment is misconfigured." }, { status: 409 });
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: assignment.teamId, internId: session.userId, leftAt: null },
      select: { id: true },
    });
    if (!membership) return NextResponse.json({ error: "You are not a member of the assigned team." }, { status: 403 });
    if (parsed.data.submissionType === SubmissionType.TEAM) targetTeamId = assignment.teamId;
    else targetInternId = session.userId;
  }

  const submission = await prisma.taskSubmission.create({
    data: {
      assignmentId: assignment.id,
      submissionType: parsed.data.submissionType,
      submittedById: session.userId,
      submittedForInternId: targetInternId,
      submittedForTeamId: targetTeamId,
      content: parsed.data.content || null,
      referenceUrl: parsed.data.referenceUrl || null,
    },
    select: { id: true, submissionType: true, reviewStatus: true, submittedAt: true, content: true, referenceUrl: true },
  });
  return NextResponse.json({ submission }, { status: 201 });
}
