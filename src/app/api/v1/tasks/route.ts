import { NextResponse } from "next/server";
import { AssignmentType, TaskStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const assignmentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("INDIVIDUAL"), internId: z.string().cuid() }),
  z.object({ type: z.literal("TEAM"), teamId: z.string().cuid() }),
]);

const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(10000),
  deadline: z.string().datetime().optional(),
  assignments: z.array(assignmentSchema).min(1).max(100),
});

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const tasks = await prisma.task.findMany({
    include: {
      assignments: {
        include: {
          intern: { select: { id: true, name: true, internCode: true } },
          team: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
      },
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid task details.", details: parsed.error.flatten() }, { status: 400 });

  const assignments = parsed.data.assignments;
  const individualIds = [...new Set(assignments.filter((a) => a.type === AssignmentType.INDIVIDUAL).map((a) => a.internId))];
  const teamIds = [...new Set(assignments.filter((a) => a.type === AssignmentType.TEAM).map((a) => a.teamId))];

  const task = await prisma.$transaction(async (tx) => {
    const [internCount, teamCount] = await Promise.all([
      tx.user.count({ where: { id: { in: individualIds }, role: UserRole.INTERN, status: "ACTIVE" } }),
      tx.team.count({ where: { id: { in: teamIds }, isActive: true } }),
    ]);
    if (internCount !== individualIds.length || teamCount !== teamIds.length) throw new Error("An assignment target is invalid or inactive.");

    return tx.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        status: TaskStatus.ASSIGNED,
        createdById: session.userId,
        assignments: {
          create: assignments.map((assignment) => assignment.type === "INDIVIDUAL"
            ? { type: AssignmentType.INDIVIDUAL, internId: assignment.internId }
            : { type: AssignmentType.TEAM, teamId: assignment.teamId }),
        },
      },
      include: { assignments: true },
    });
  }).catch((error) => {
    if (error instanceof Error && error.message.includes("assignment target")) return null;
    throw error;
  });

  if (!task) return NextResponse.json({ error: "An assignment target is invalid or inactive." }, { status: 400 });
  return NextResponse.json({ task }, { status: 201 });
}
