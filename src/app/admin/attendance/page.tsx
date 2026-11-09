import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";
import { AdminCreateForm } from "@/components/admin-create-form";

export default async function AdminAttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const today = new Date();
  const workDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const [records, interns] = await Promise.all([
    prisma.attendance.findMany({ where: { workDate }, include: { intern: { select: { name: true, internCode: true } } }, orderBy: { intern: { name: "asc" } } }),
    prisma.user.findMany({ where: { role: UserRole.INTERN, status: "ACTIVE" }, select: { id: true, name: true, internCode: true } }),
  ]);
  return <><AdminCreateForm kind="attendance" interns={interns}/><AdminRecords title="Working-day attendance" description={`Attendance records for ${today.toLocaleDateString("en-IN")} · Meeting attendance is managed separately.`} records={records.map((record) => ({ id: record.id, primary: record.intern.name, secondary: record.intern.internCode ?? "Intern", status: record.status, extra: record.note ?? "—" }))} emptyText="Attendance has not been marked for today."/></>;
}
