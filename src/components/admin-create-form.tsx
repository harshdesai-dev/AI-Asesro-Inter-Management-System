"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

type PersonOption = { id: string; name: string; internCode?: string | null };
type TeamOption = { id: string; name: string };
type Props = { kind: "intern" | "team" | "task" | "meeting" | "attendance"; interns?: PersonOption[]; teams?: TeamOption[] };

export function AdminCreateForm({ kind, interns = [], teams = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, string>>({});

  const titles = { intern: "Add intern", team: "Create team", task: "Assign a task", meeting: "Schedule meeting", attendance: "Mark attendance" };
  const endpoints = { intern: "/api/v1/interns", team: "/api/v1/teams", task: "/api/v1/tasks", meeting: "/api/v1/meetings", attendance: "/api/v1/attendance" };

  function toggle(list: string[], setList: (value: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    let payload: Record<string, unknown>;

    if (kind === "intern") {
      payload = { name: form.get("name"), email: form.get("email"), password: form.get("password"), internCode: form.get("internCode"), position: form.get("position") };
    } else if (kind === "team") {
      payload = { name: form.get("name"), description: form.get("description"), internIds: selectedInterns };
    } else if (kind === "task") {
      const assignments = [
        ...selectedInterns.map((internId) => ({ type: "INDIVIDUAL", internId })),
        ...selectedTeams.map((teamId) => ({ type: "TEAM", teamId })),
      ];
      payload = { title: form.get("title"), description: form.get("description"), deadline: form.get("deadline") ? new Date(String(form.get("deadline"))).toISOString() : undefined, assignments };
    } else if (kind === "attendance") {
      payload = { workDate: form.get("workDate"), records: selectedInterns.map((internId) => ({ internId, status: attendanceStatuses[internId] ?? "PRESENT" })) };
    } else {
      payload = {
        title: form.get("title"),
        description: form.get("description"),
        type: form.get("type"),
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        endsAt: new Date(String(form.get("endsAt"))).toISOString(),
        meetingUrl: form.get("meetingUrl") || undefined,
        teamId: form.get("teamId") || undefined,
        participantIds: selectedInterns,
      };
    }

    try {
      const response = await fetch(endpoints[kind], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save this record.");
      setMessage("Saved successfully.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-create">
      <button className="admin-create-toggle" onClick={() => setOpen(!open)} type="button">{open ? <X size={16}/> : <Plus size={16}/>} {open ? "Close" : titles[kind]}</button>
      {open && <form className="admin-create-form" onSubmit={submit}>
        {kind === "intern" && <>
          <div className="form-grid">
            <label>Full name<input name="name" required minLength={2} maxLength={100}/></label>
            <label>Email address<input name="email" type="email" required/></label>
            <label>Initial password<input name="password" type="password" required minLength={12}/></label>
            <label>Intern ID<input name="internCode" maxLength={40}/></label>
            <label>Position<input name="position" maxLength={80}/></label>
          </div>
          <p className="form-hint">Use a temporary password with at least 12 characters and share it securely with the intern.</p>
        </>}
        {kind === "team" && <>
          <div className="form-grid"><label>Team name<input name="name" required minLength={2}/></label><label>Description<input name="description" maxLength={500}/></label></div>
          <p className="form-hint">Select interns to add. Each intern can belong to one active team.</p>
          <div className="option-grid">{interns.map((intern) => <label className="option-check" key={intern.id}><input type="checkbox" checked={selectedInterns.includes(intern.id)} onChange={() => toggle(selectedInterns, setSelectedInterns, intern.id)}/>{intern.name}</label>)}</div>
        </>}
        {kind === "task" && <>
          <div className="form-grid"><label>Task title<input name="title" required minLength={3}/></label><label>Deadline<input name="deadline" type="datetime-local"/></label></div>
          <label className="wide-field">Description<textarea name="description" rows={3} required/></label>
          <p className="form-hint">Select individual interns and/or teams. Team assignments support both individual and team submissions.</p>
          <div className="assignment-options">
            <div><strong>Individual interns</strong><div className="option-grid">{interns.map((intern) => <label className="option-check" key={intern.id}><input type="checkbox" checked={selectedInterns.includes(intern.id)} onChange={() => toggle(selectedInterns, setSelectedInterns, intern.id)}/>{intern.name}</label>)}</div></div>
            <div><strong>Teams</strong><div className="option-grid">{teams.map((team) => <label className="option-check" key={team.id}><input type="checkbox" checked={selectedTeams.includes(team.id)} onChange={() => toggle(selectedTeams, setSelectedTeams, team.id)}/>{team.name}</label>)}</div></div>
          </div>
        </>}
        {kind === "attendance" && <>
          <label>Working date<input name="workDate" type="date" defaultValue={new Date().toLocaleDateString("en-CA")} required/></label>
          <p className="form-hint">Select interns and choose their individual status. This is working-day attendance, separate from meeting attendance.</p>
          <div className="attendance-mark-list">{interns.map((intern) => <div className="attendance-mark-row" key={intern.id}>
            <label className="option-check"><input type="checkbox" checked={selectedInterns.includes(intern.id)} onChange={() => toggle(selectedInterns, setSelectedInterns, intern.id)}/>{intern.name}</label>
            <select aria-label={`Attendance for ${intern.name}`} value={attendanceStatuses[intern.id] ?? "PRESENT"} onChange={(event) => setAttendanceStatuses((current) => ({ ...current, [intern.id]: event.target.value }))}><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option><option value="HALF_DAY">Half day</option></select>
          </div>)}</div>
        </>}
        {kind === "meeting" && <>
          <div className="form-grid">
            <label>Meeting title<input name="title" required minLength={3}/></label>
            <label>Meeting type<select name="type"><option value="GENERAL">General</option><option value="TEAM">Team</option><option value="INDIVIDUAL">Individual</option></select></label>
            <label>Starts at<input name="startsAt" type="datetime-local" required/></label>
            <label>Ends at<input name="endsAt" type="datetime-local" required/></label>
            <label>Meeting link<input name="meetingUrl" type="url" placeholder="https://..."/></label>
            <label>Team (optional)<select name="teamId"><option value="">No specific team</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
          </div>
          <label className="wide-field">Description<textarea name="description" rows={2}/></label>
          <p className="form-hint">Choose the interns who should receive this meeting invitation.</p>
          <div className="option-grid">{interns.map((intern) => <label className="option-check" key={intern.id}><input type="checkbox" checked={selectedInterns.includes(intern.id)} onChange={() => toggle(selectedInterns, setSelectedInterns, intern.id)}/>{intern.name}</label>)}</div>
        </>}
        {message && <p className="form-message" role="status">{message}</p>}
        <div className="form-actions"><button className="admin-create-submit" disabled={busy}>{busy ? "Saving..." : "Save"}</button></div>
      </form>}
    </section>
  );
}
