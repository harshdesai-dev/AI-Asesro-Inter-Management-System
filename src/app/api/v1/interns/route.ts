import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createInternSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
  internCode: z.string().trim().max(40).optional(),
  position: z.string().trim().max(80).optional(),
});

export async function GET() {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const interns = await prisma.user.findMany({
    where: { role: UserRole.INTERN },
    select: {
      id: true, name: true, email: true, status: true, internCode: true,
      position: true, createdAt: true,
      teamMemberships: { where: { leftAt: null }, include: { team: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ interns });
}

export async function POST(request: Request) {
  const session = await requireRole([UserRole.ADMIN]);
  if (!session) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = createInternSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid intern details.", details: parsed.error.flatten() }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  const intern = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      internCode: parsed.data.internCode || null,
      position: parsed.data.position || null,
      role: UserRole.INTERN,
      status: UserStatus.ACTIVE,
    },
    select: { id: true, name: true, email: true, internCode: true, position: true, status: true, createdAt: true },
  });
  return NextResponse.json({ intern }, { status: 201 });
}
