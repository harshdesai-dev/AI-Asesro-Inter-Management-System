import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskSubmissionForm } from "@/components/task-submission-form";

export default async function MyTasksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.INTERN) redirect("/");
  const memberships = await prisma.teamMember.findMany({ where: { internId: session.userId, leftAt: null }, select: { teamId: true } });
  const teamIds = memberships.map((item) => item.teamId);
  const assignments = await prisma.taskAssignment.findMany({
    where: { OR: [{ internId: session.userId }, ...(teamIds.length ? [{ teamId: { in: teamIds } }] : [])] },
    include: {
      task: { select: { id: true, title: true, description: true, deadline: true, status: true } },
      team: { select: { name: true } },
      submissions: {
        where: { OR: [{ submittedForInternId: session.userId }, ...(teamIds.length ? [{ submittedForTeamId: { in: teamIds } }] : [])] },
        orderBy: { submittedAt: "desc" }, take: 3,
        select: { id: true, submissionType: true, reviewStatus: true, submittedAt: true, reviewNote: true },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return <main className="records-screen">
    <header className="records-top"><Link href="/intern"><ArrowLeft size={16}/> Back to dashboard</Link><span className="eyebrow">AI ASESRO INTERNHUB</span></header>
    <section className="records-content">
      <span className="eyebrow">MY WORKSPACE</span><h1>My tasks</h1><p>Assignments shared with you or your team. Submit your work before the deadline.</p>
      <div className="task-card-list">{assignments.length ? assignments.map((assignment) => <article className="task-card" key={assignment.id}>
        <div className="task-card-head"><div><span className="eyebrow">{assignment.team?.name ? `TEAM · ${assignment.team.name}` : "INDIVIDUAL ASSIGNMENT"}</span><h2>{assignment.task.title}</h2></div><span className="status-pill">{assignment.task.status.replaceAll("_"," ")}</span></div>
        <p className="task-description">{assignment.task.description}</p>
        <div className="task-deadline">{assignment.task.deadline ? `Deadline: ${assignment.task.deadline.toLocaleString("en-IN")}` : "No deadline specified"}</div>
        {assignment.submissions.length > 0 && <div className="submission-history"><strong>Recent submissions</strong>{assignment.submissions.map((submission) => <div key={submission.id}><span>{submission.submissionType} · {submission.submittedAt.toLocaleString("en-IN")}</span><span className="status-pill">{submission.reviewStatus.replaceAll("_"," ")}</span>{submission.reviewNote && <small>{submission.reviewNote}</small>}</div>)}</div>}
        {assignment.task.status !== "CANCELLED" && <TaskSubmissionForm taskId={assignment.task.id} assignmentId={assignment.id} teamAssignment={Boolean(assignment.teamId)}/>}
      </article>) : <div className="records-panel"><p className="empty-state">No tasks have been assigned yet.</p></div>}</div>
    </section>
  </main>;
}
