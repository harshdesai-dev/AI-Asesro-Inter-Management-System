import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InternRecords } from "@/components/intern-records";

export default async function MyAttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.INTERN) redirect("/");
  const records = await prisma.attendance.findMany({ where: { internId: session.userId }, orderBy: { workDate: "desc" }, take: 120 });
  return <InternRecords kind="attendance" title="My attendance" description="Your working-day attendance history. Meeting attendance is recorded separately." items={records.map((r) => ({ id: r.id, title: r.workDate.toLocaleDateString("en-IN", { dateStyle: "full" }), detail: r.note || "No note added", status: r.status }))} />;
}
