import Link from "next/link";
import { CalendarCheck, CalendarDays, CheckSquare, Clock3, LogOut, Video } from "lucide-react";

type Props = {
  name: string;
  internCode: string;
  position: string;
  attendanceCount: number;
  tasks: Array<{ id: string; title: string; deadline: Date | null; status: string }>;
  meetings: Array<{ id: string; title: string; startsAt: Date; endsAt: Date; meetingUrl: string | null }>;
};

export function InternDashboard({ name, internCode, position, attendanceCount, tasks, meetings }: Props) {
  const pendingTasks = tasks.filter((task) => !["SUBMITTED", "REVIEWED", "CANCELLED"].includes(task.status)).length;
  return (
    <main className="intern-screen">
      <aside className="intern-sidebar">
        <div className="brand"><div className="brand-mark"><span>AI</span></div><div className="brand-copy"><strong>AI ASESRO</strong><span>Intern<span className="gradient-text">Hub</span></span></div></div>
        <div className="workspace-label">MY WORKSPACE</div>
        <nav className="side-nav">
          <Link className="nav-item active" href="/intern"><CalendarDays size={18}/> Dashboard</Link>
          <Link className="nav-item" href="/intern/tasks"><CheckSquare size={18}/> My Tasks</Link>
          <Link className="nav-item" href="/intern/attendance"><CalendarCheck size={18}/> My Attendance</Link>
          <Link className="nav-item" href="/intern/meetings"><Video size={18}/> My Meetings</Link>
        </nav>
        <div className="intern-profile"><div className="avatar">{name.split(" ").map((part) => part[0]).join("").slice(0,2)}</div><div><strong>{name}</strong><span>{position}</span></div></div>
        <form action="/api/v1/auth/logout" method="post"><button className="logout"><LogOut size={17}/> Sign out</button></form>
      </aside>
      <section className="intern-main">
        <header className="intern-topbar"><span className="eyebrow">INTERN WORKSPACE / OVERVIEW</span><span className="intern-id">{internCode}</span></header>
        <div className="intern-content">
          <section className="hero-banner intern-hero"><div className="hero-copy"><span className="eyebrow">YOUR INTERNSHIP JOURNEY</span><h1>Hello, {name.split(" ")[0]} <span className="wave">✦</span></h1><p>Stay focused, keep learning and make progress every day.</p></div><div className="hero-brand"><div className="hero-brand-name">AI ASESRO <strong>Intern<span>Hub</span></strong></div><p>Learn <b>·</b> Contribute <b>·</b> Grow</p></div></section>
          <div className="section-heading"><div><span className="eyebrow">YOUR OVERVIEW</span><h2>Personal snapshot</h2></div></div>
          <section className="metric-grid intern-metrics">
            <article className="metric-card"><div className="metric-icon blue"><CheckSquare size={21}/></div><div className="metric-copy"><span>Open tasks</span><strong>{pendingTasks}</strong><small>Assigned to you</small></div></article>
            <article className="metric-card"><div className="metric-icon teal"><CalendarCheck size={21}/></div><div className="metric-copy"><span>Present days</span><strong>{attendanceCount}</strong><small>Recorded attendance</small></div></article>
            <article className="metric-card"><div className="metric-icon purple"><Video size={21}/></div><div className="metric-copy"><span>Upcoming meetings</span><strong>{meetings.length}</strong><small>On your calendar</small></div></article>
            <article className="metric-card"><div className="metric-icon violet"><Clock3 size={21}/></div><div className="metric-copy"><span>Position</span><strong className="position-value">{position}</strong><small>Internship role</small></div></article>
          </section>
          <section className="middle-grid intern-panels">
            <article className="panel"><div className="panel-heading"><div><span className="eyebrow">YOUR WORK</span><h3>Recent tasks</h3></div><span className="text-link">Latest assignments</span></div>
              <div className="activity-list">{tasks.length ? tasks.map((task) => <div className="activity-row" key={task.id}><div className="activity-icon blue"><CheckSquare size={17}/></div><div className="activity-copy"><strong>{task.title}</strong><span>{task.deadline ? `Due ${task.deadline.toLocaleDateString("en-IN")}` : "No deadline set"}</span></div><span className="status-pill">{task.status.replaceAll("_"," ")}</span></div>) : <p className="empty-state">No tasks have been assigned yet.</p>}</div>
            </article>
            <article className="panel"><div className="panel-heading"><div><span className="eyebrow">ON YOUR CALENDAR</span><h3>Upcoming meetings</h3></div></div>
              <div className="meeting-list">{meetings.length ? meetings.map((meeting) => <div className="meeting-row" key={meeting.id}><div className="meeting-date"><strong>{meeting.startsAt.getDate()}</strong><span>{meeting.startsAt.toLocaleString("en-IN",{month:"short"}).toUpperCase()}</span></div><div className="meeting-copy"><strong>{meeting.title}</strong><span>{meeting.startsAt.toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit"})} – {meeting.endsAt.toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit"})}</span></div>{meeting.meetingUrl ? <a className="status-pill" href={meeting.meetingUrl} target="_blank" rel="noreferrer">Join</a> : <span className="status-pill">Scheduled</span>}</div>) : <p className="empty-state">No upcoming meetings.</p>}</div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
