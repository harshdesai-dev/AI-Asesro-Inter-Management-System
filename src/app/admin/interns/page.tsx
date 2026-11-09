import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminRecords } from "@/components/admin-records";

export default async function AdminInternsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const interns = await prisma.user.findMany({
    where: { role: UserRole.INTERN },
    include: { teamMemberships: { where: { leftAt: null }, include: { team: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return <AdminRecords title="Intern management" description="View and manage the people in your internship program." records={interns.map((intern) => ({ id: intern.id, primary: intern.name, secondary: intern.email, status: intern.status, extra: [intern.internCode, intern.position, intern.teamMemberships[0]?.team.name].filter(Boolean).join(" · ") }))} emptyText="No interns have been added yet." />;
}
