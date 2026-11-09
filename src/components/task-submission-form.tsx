"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

export function TaskSubmissionForm({ taskId, assignmentId, teamAssignment }: { taskId: string; assignmentId: string; teamAssignment: boolean }) {
  const [open, setOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<"INDIVIDUAL" | "TEAM">("INDIVIDUAL");
  const [content, setContent] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, submissionType, content, referenceUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to submit task.");
      setMessage("Submission received.");
      setContent("");
      setReferenceUrl("");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit task.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="task-submit-wrap">
    <button className="admin-create-toggle" type="button" onClick={() => setOpen(!open)}><Send size={14}/>{open ? "Close submission" : "Submit work"}</button>
    {open && <form className="task-submit-form" onSubmit={submit}>
      {teamAssignment && <label>Submission type<select value={submissionType} onChange={(event) => setSubmissionType(event.target.value as "INDIVIDUAL" | "TEAM")}><option value="INDIVIDUAL">My individual submission</option><option value="TEAM">Submit on behalf of team</option></select></label>}
      <label>Work update<textarea rows={3} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Describe what you completed..."/></label>
      <label>Reference link (optional)<input type="url" value={referenceUrl} onChange={(event) => setReferenceUrl(event.target.value)} placeholder="https://github.com/..."/></label>
      {message && <p className="form-message">{message}</p>}
      <button className="admin-create-submit" disabled={busy}>{busy ? "Submitting..." : "Send submission"}</button>
    </form>}
  </div>;
}
