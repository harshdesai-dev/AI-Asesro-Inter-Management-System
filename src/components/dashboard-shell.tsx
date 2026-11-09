"use client";

import { useEffect, useState } from "react";
import {
  Bell, CalendarCheck, CalendarDays, ChartNoAxesCombined, CheckSquare,
  ChevronDown, ClipboardList, Command, Home, LogOut, Menu, Moon, Search,
  Sun, Users, UsersRound, Video,
} from "lucide-react";

type DashboardData = {
  stats: { totalInterns: number; tasksAssigned: number; attendanceRate: number | null; meetingsThisMonth: number; attendanceMarked: number };
  activities: Array<{ id: string; title: string; detail: string; time: string; tone: string; kind: string }>;
  upcomingMeetings: Array<{ id: string; day: string; month: string; title: string; detail: string; people: string }>;
};

const navigation = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Intern Management", icon: Users, href: "/admin/interns" },
  { label: "Team Management", icon: UsersRound, href: "/admin/teams" },
  { label: "Task Management", icon: ClipboardList, href: "/admin/tasks" },
  { label: "Attendance", icon: CalendarCheck, href: "/admin/attendance" },
  { label: "Meeting Management", icon: CalendarDays, href: "/admin/meetings" },
  { label: "Performance", icon: ChartNoAxesCombined, href: "/admin/performance" },
];

const metricDefinitions = [
  { label: "Total Interns", icon: Users, tone: "blue", points: "0,27 13,23 25,25 39,13 53,18 67,8 82,11 96,2" },
  { label: "Tasks Assigned", icon: CheckSquare, tone: "purple", points: "0,25 13,18 26,21 40,9 54,14 68,5 82,9 96,1" },
  { label: "Attendance Rate", icon: CalendarCheck, tone: "teal", points: "0,22 13,19 26,23 40,11 54,14 68,5 82,8 96,1" },
  { label: "Meetings This Month", icon: Video, tone: "violet", points: "0,25 13,21 26,15 40,19 54,8 68,12 82,4 96,1" },
];

export function DashboardShell() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    fetch("/api/v1/dashboard")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load dashboard");
        return response.json();
      })
      .then((data: DashboardData) => setDashboard(data))
      .catch(() => setDashboard(null));
  }, []);

  function metricValue(label: string) {
    if (!dashboard) return "—";
    if (label === "Total Interns") return String(dashboard.stats.totalInterns);
    if (label === "Tasks Assigned") return String(dashboard.stats.tasksAssigned);
    if (label === "Attendance Rate") return dashboard.stats.attendanceRate === null ? "—" : `${dashboard.stats.attendanceRate}%`;
    return String(dashboard.stats.meetingsThisMonth);
  }

  function metricNote(label: string) {
    if (!dashboard) return "Loading live data";
    if (label === "Attendance Rate") return dashboard.stats.attendanceMarked ? `${dashboard.stats.attendanceMarked} marked today` : "No records today";
    return "Live database count";
  }

  return (
    <main className={dark ? "app-shell" : "app-shell light-mode"}>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><span>AI</span></div>
          <div className="brand-copy"><strong>AI ASESRO</strong><span>Intern<span className="gradient-text">Hub</span></span></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, href }) => (
            <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => { setActive(label); setMenuOpen(false); window.location.assign(href); }}>
              <Icon size={18} strokeWidth={1.8}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          
          <div className="profile-mini"><div className="avatar">A</div><div><strong>Administrator</strong><span>AI ASESRO</span></div><ChevronDown size={15} className="muted-icon"/></div>
          <form action="/api/v1/auth/logout" method="post"><button className="logout"><LogOut size={17}/> Log out</button></form>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><Menu size={20}/></button>
          <div className="search-box"><Search size={17}/><span>Search anything...</span><kbd><Command size={11}/> K</kbd></div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
            <button className="icon-button notification" aria-label="Notifications"><Bell size={19}/><i/></button>
            <div className="avatar avatar-top">A</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="hero-banner">
            <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> INTERNSHIP OPERATIONS</div><h1>Welcome to InternHub <span className="wave">✦</span></h1><p>Manage your internship program from one workspace.</p></div>
            <div className="hero-brand"><div className="hero-brand-name">AI ASESRO <strong>Intern<span>Hub</span></strong></div><p>Learn <b>·</b> Contribute <b>·</b> Grow</p></div>
            <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          </section>

          <div className="section-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Program snapshot</h2></div><span className="date-chip">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</span></div>

          <section className="metric-grid">
            {metricDefinitions.map(({ label, icon: Icon, tone, points }) => (
              <article className="metric-card" key={label}>
                <div className={`metric-icon ${tone}`}><Icon size={21}/></div>
                <div className="metric-copy"><span>{label}</span><strong>{metricValue(label)}</strong><small>{metricNote(label)}</small></div>
                <svg className="sparkline" viewBox="0 0 96 30" aria-hidden="true"><polyline points={points}/></svg>
              </article>
            ))}
          </section>

          <section className="middle-grid">
            <article className="panel performance-panel">
              <div className="panel-heading"><div><span className="eyebrow">PERFORMANCE</span><h3>Intern performance overview</h3></div></div>
              <div className="performance-content">
                <div className="donut-wrap"><div className="donut"><div><strong>—</strong><span>Awaiting records</span></div></div></div>
                <div className="legend-list">
                  <div><i className="legend-dot cyan"/><span>Task completion</span><strong>—</strong></div>
                  <div><i className="legend-dot purple-dot"/><span>Attendance</span><strong>—</strong></div>
                  <div><i className="legend-dot blue-dot"/><span>Timely submissions</span><strong>—</strong></div>
                </div>
              </div>
              <p className="empty-state">Performance scores will appear when task reviews and attendance records are available.</p>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading"><div><span className="eyebrow">LIVE FEED</span><h3>Recent activity</h3></div></div>
              <div className="activity-list">
                {dashboard?.activities.length ? dashboard.activities.map((activity) => (
                  <div className="activity-row" key={activity.id}>
                    <div className={`activity-icon ${activity.tone}`}>{activity.kind === "submission" ? <CheckSquare size={17}/> : <CalendarCheck size={17}/>}</div>
                    <div className="activity-copy"><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                    <time>{new Date(activity.time).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                )) : <p className="empty-state">{dashboard ? "No recent activity yet." : "Loading recent activity..."}</p>}
              </div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel performers-panel">
              <div className="panel-heading"><div><span className="eyebrow">RECOGNITION</span><h3>Top performers</h3></div></div>
              <p className="empty-state">Rankings will appear once interns have enough reviewed tasks and attendance history.</p>
            </article>
            <article className="panel meetings-panel">
              <div className="panel-heading"><div><span className="eyebrow">YOUR CALENDAR</span><h3>Upcoming meetings</h3></div></div>
              <div className="meeting-list">
                {dashboard?.upcomingMeetings.length ? dashboard.upcomingMeetings.map((meeting) => (
                  <div className="meeting-row" key={meeting.id}><div className="meeting-date"><strong>{meeting.day}</strong><span>{meeting.month}</span></div><div className="meeting-copy"><strong>{meeting.title}</strong><span>{meeting.detail} · {meeting.people}</span></div><span className="status-pill">Upcoming</span></div>
                )) : <p className="empty-state">{dashboard ? "No upcoming meetings scheduled." : "Loading meetings..."}</p>}
              </div>
            </article>
          </section>
          <footer className="footer"><span>© 2026 AI ASESRO InternHub. All rights reserved.</span><span>Built with <b>♥</b> by AI ASESRO</span></footer>
        </div>
      </section>
    </main>
  );
}
