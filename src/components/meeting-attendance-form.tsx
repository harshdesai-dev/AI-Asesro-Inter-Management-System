"use client";

import { FormEvent, useState } from "react";

type Participant = { id: string; name: string; internCode: string | null; status: "PRESENT" | "ABSENT" | "LATE" | null };

export function MeetingAttendanceForm({ meetingId, participants, cancelled }: { meetingId: string; participants: Participant[]; cancelled: boolean }) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() => Object.fromEntries(participants.map((person) => [person.id, person.status ?? "UNMARKED"])));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/v1/meetings/${meetingId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: participants.map((person) => ({ internId: person.id, status: statuses[person.id] })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save attendance.");
      setMessage("Meeting attendance saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save attendance.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="admin-create-form" onSubmit={submit}>
    {cancelled ? <p className="form-hint">This meeting was cancelled. Attendance cannot be marked.</p> : <>
      <p className="form-hint">Set a separate meeting attendance status for each participant.</p>
      <div className="attendance-mark-list">{participants.map((person) => <div className="attendance-mark-row" key={person.id}>
        <div className="record-copy"><strong>{person.name}</strong><span>{person.internCode ?? "Intern"}</span></div>
        <select aria-label={`Meeting attendance for ${person.name}`} value={statuses[person.id]} onChange={(event) => setStatuses((current) => ({ ...current, [person.id]: event.target.value }))}><option value="UNMARKED" disabled>Not marked</option><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option></select>
      </div>)}</div>
      <div className="form-actions"><button className="admin-create-submit" disabled={busy || participants.length === 0}>{busy ? "Saving..." : "Save meeting attendance"}</button></div>
    </>}
    {message && <p className="form-message" role="status">{message}</p>}
  </form>;
}
