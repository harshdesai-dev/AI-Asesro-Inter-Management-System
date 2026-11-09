import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  internIds: z.array(z.string().cuid()).max(100).default([]),
});

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const teams = await prisma.team.findMany({
    include: {
      members: { where: { leftAt: null }, include: { intern: { select: { id: true, name: true, email: true, internCode: true } } } },
      _count: { select: { assignments: true, meetings: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid team details.", details: parsed.error.flatten() }, { status: 400 });

  const ids = [...new Set(parsed.data.internIds)];
  const team = await prisma.$transaction(async (tx) => {
    const activeInterns = await tx.user.count({ where: { id: { in: ids }, role: UserRole.INTERN, status: "ACTIVE" } });
    if (activeInterns !== ids.length) throw new Error("One or more selected interns are invalid or inactive.");
    return tx.team.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        members: { create: ids.map((internId) => ({ internId })) },
      },
      include: { members: { include: { intern: { select: { id: true, name: true, email: true } } } } },
    });
  }).catch((error) => {
    if (error instanceof Error && error.message.includes("selected interns")) return null;
    throw error;
  });
  if (!team) return NextResponse.json({ error: "One or more selected interns are invalid or inactive." }, { status: 400 });
  return NextResponse.json({ team }, { status: 201 });
}
