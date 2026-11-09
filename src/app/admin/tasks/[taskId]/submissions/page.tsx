import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmissionReviewForm } from "@/components/submission-review-form";

export default async function TaskSubmissionsPage({ params }: { params: Promise<{ taskId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== UserRole.ADMIN) redirect("/intern");
  const { taskId } = await params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignments: {
        include: {
          intern: { select: { name: true, email: true } },
          team: { select: { name: true } },
          submissions: {
            include: { submittedBy: { select: { name: true } }, submittedForIntern: { select: { name: true } }, submittedForTeam: { select: { name: true } } },
            orderBy: { submittedAt: "desc" },
          },
        },
      },
    },
  });
  if (!task) notFound();
  const submissions = task.assignments.flatMap((assignment) => assignment.submissions);
  return <main className="records-screen">
    <header className="records-top"><Link href="/admin/tasks"><ArrowLeft size={16}/> Back to tasks</Link><span className="eyebrow">AI ASESRO INTERNHUB · ADMIN</span></header>
    <section className="records-content">
      <span className="eyebrow">TASK SUBMISSIONS</span><h1>{task.title}</h1><p>{task.deadline ? `Deadline: ${task.deadline.toLocaleString("en-IN")}` : "No deadline specified"} · {submissions.length} submissions</p>
      <div className="task-card-list">{submissions.length ? submissions.map((submission) => <article className="task-card" key={submission.id}>
        <div className="task-card-head"><div><span className="eyebrow">{submission.submissionType} SUBMISSION</span><h2>{submission.submittedForTeam?.name ?? submission.submittedForIntern?.name ?? "Submission"}</h2></div><span className="status-pill">{submission.reviewStatus.replaceAll("_"," ")}</span></div>
        <p className="task-description">{submission.content ?? "No written update provided."}</p>
        {submission.referenceUrl && <p><a className="record-action-link" href={submission.referenceUrl} target="_blank" rel="noreferrer">Open submitted link ↗</a></p>}
        <p className="form-hint">Submitted by {submission.submittedBy.name} · {submission.submittedAt.toLocaleString("en-IN")}</p>
        <SubmissionReviewForm taskId={task.id} submissionId={submission.id} initialStatus={submission.reviewStatus} initialNote={submission.reviewNote}/>
      </article>) : <div className="records-panel"><p className="empty-state">No submissions have been received for this task.</p></div>}</div>
    </section>
  </main>;
}
