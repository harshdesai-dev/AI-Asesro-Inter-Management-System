"use client";

import { FormEvent, useState } from "react";

export function SubmissionReviewForm({ taskId, submissionId, initialStatus, initialNote }: { taskId: string; submissionId: string; initialStatus: string; initialNote: string | null }) {
  const [status, setStatus] = useState(initialStatus === "APPROVED" || initialStatus === "NEEDS_CHANGES" ? initialStatus : "APPROVED");
  const [note, setNote] = useState(initialNote ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewStatus: status, reviewNote: note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save review.");
      setMessage("Review saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save review.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="review-form" onSubmit={submit}>
    <select aria-label="Review decision" value={status} onChange={(event) => setStatus(event.target.value)}><option value="APPROVED">Approved</option><option value="NEEDS_CHANGES">Needs changes</option></select>
    <textarea aria-label="Review note" rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional feedback for the intern"/>
    <div className="review-actions"><span className="form-message">{message}</span><button className="admin-create-submit" disabled={busy}>{busy ? "Saving..." : "Save review"}</button></div>
  </form>;
}
