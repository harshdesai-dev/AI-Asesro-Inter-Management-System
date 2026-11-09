import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";

export default async function AdminTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const tasks = await prisma.task.findMany({ include: { assignments: { include: { submissions: true } } }, orderBy: { createdAt: "desc" } });
  return <AdminRecords title="Task management" description="Track individual and team assignments, deadlines and submissions." records={tasks.map((task) => ({ id: task.id, primary: task.title, secondary: task.deadline ? `Deadline: ${task.deadline.toLocaleString("en-IN")}` : "No deadline", status: task.status, extra: `${task.assignments.length} assignments · ${task.assignments.reduce((n, a) => n + a.submissions.length, 0)} submissions` }))} emptyText="No tasks have been created yet." />;
}
