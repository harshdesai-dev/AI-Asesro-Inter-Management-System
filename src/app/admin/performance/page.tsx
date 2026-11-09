import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";

export default async function AdminPerformancePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const interns = await prisma.user.findMany({ where: { role: UserRole.INTERN, status: "ACTIVE" }, include: { attendanceRecords: true, receivedSubmissions: true }, orderBy: { name: "asc" } });
  return <AdminRecords title="Intern performance" description="Initial performance indicators based on recorded attendance and individual task submissions. Team submissions are not attributed to individual scores yet." records={interns.map((intern) => {
    const attendance = intern.attendanceRecords;
    const present = attendance.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
    const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : null;
    return { id: intern.id, primary: intern.name, secondary: intern.internCode ?? intern.email, status: attendanceRate === null ? "NO_DATA" : `${attendanceRate}% ATTENDANCE`, extra: `${intern.receivedSubmissions.length} individual submissions` };
  })} emptyText="No active interns to evaluate yet." />;
}
