import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.role !== UserRole.INTERN) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const records = await prisma.attendance.findMany({
    where: { internId: session.userId },
    orderBy: { workDate: "desc" },
    take: 180,
    select: { id: true, workDate: true, status: true, note: true, markedAt: true },
  });
  return NextResponse.json({ records });
}
