import { NextResponse } from "next/server";
import { AttendanceStatus, UserRole } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const markSchema = z.object({
  workDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  records: z.array(z.object({
    internId: z.string().cuid(),
    status: z.nativeEnum(AttendanceStatus),
    note: z.string().trim().max(500).optional(),
  })).min(1).max(300),
});

export async function GET(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date || !/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Provide date as YYYY-MM-DD." }, { status: 400 });
  }
  const records = await prisma.attendance.findMany({
    where: { workDate: new Date(`${date}T00:00:00.000Z`) },
    include: { intern: { select: { id: true, name: true, internCode: true } }, markedBy: { select: { id: true, name: true } } },
    orderBy: { intern: { name: "asc" } },
  });
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = markSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid attendance data.", details: parsed.error.flatten() }, { status: 400 });

  const records = parsed.data.records;
  const ids = records.map((record) => record.internId);
  if (new Set(ids).size !== ids.length) return NextResponse.json({ error: "An intern can appear only once per date." }, { status: 400 });

  const validCount = await prisma.user.count({ where: { id: { in: ids }, role: UserRole.INTERN, status: "ACTIVE" } });
  if (validCount !== ids.length) return NextResponse.json({ error: "One or more interns are invalid or inactive." }, { status: 400 });

  const workDate = new Date(`${parsed.data.workDate}T00:00:00.000Z`);
  const saved = await prisma.$transaction(records.map((record) => prisma.attendance.upsert({
    where: { internId_workDate: { internId: record.internId, workDate } },
    create: { internId: record.internId, workDate, status: record.status, note: record.note || null, markedById: session.userId },
    update: { status: record.status, note: record.note || null, markedById: session.userId },
  })));
  return NextResponse.json({ records: saved });
}
