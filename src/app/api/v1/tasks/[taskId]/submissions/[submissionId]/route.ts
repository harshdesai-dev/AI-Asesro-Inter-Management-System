import { NextResponse } from "next/server";
import { SubmissionReviewStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  reviewStatus: z.enum(["APPROVED", "NEEDS_CHANGES"]),
  reviewNote: z.string().trim().max(5000).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string; submissionId: string }> }) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { taskId, submissionId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review.", details: parsed.error.flatten() }, { status: 400 });

  const submission = await prisma.taskSubmission.findFirst({ where: { id: submissionId, assignment: { taskId } }, select: { id: true } });
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });

  const updated = await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: {
      reviewStatus: parsed.data.reviewStatus as SubmissionReviewStatus,
      reviewNote: parsed.data.reviewNote || null,
      reviewedById: session.userId,
      reviewedAt: new Date(),
    },
    select: { id: true, reviewStatus: true, reviewNote: true, reviewedAt: true },
  });
  return NextResponse.json({ submission: updated });
}
