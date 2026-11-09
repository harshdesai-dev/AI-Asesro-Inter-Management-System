"use client";

import { useEffect, useState } from "react";
import {
  Activity, Bell, CalendarCheck, CalendarDays, ChartNoAxesCombined,
  CheckSquare, ChevronDown, ClipboardList, Command, Home, LogOut,
  Menu, Moon, Search, Settings, Sun, Users, UsersRound, Video,
} from "lucide-react";

const nav = [
  { label: "Dashboard", icon: Home },
  { label: "Intern Management", icon: Users },
  { label: "Team Management", icon: UsersRound },
  { label: "Task Management", icon: ClipboardList },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Meeting Management", icon: CalendarDays },
  { label: "Performance", icon: ChartNoAxesCombined },
];

const metrics = [
  { label: "Total Interns", value: "24", change: "+2 this month", icon: Users, tone: "blue", points: "0,27 13,23 25,25 39,13 53,18 67,8 82,11 96,2" },
  { label: "Tasks Assigned", value: "48", change: "+5 this week", icon: CheckSquare, tone: "purple", points: "0,25 13,18 26,21 40,9 54,14 68,5 82,9 96,1" },
  { label: "Attendance Rate", value: "96%", change: "+1.2% this month", icon: CalendarCheck, tone: "teal", points: "0,22 13,19 26,23 40,11 54,14 68,5 82,8 96,1" },
  { label: "Meetings This Month", value: "12", change: "+2 this month", icon: Video, tone: "violet", points: "0,25 13,21 26,15 40,19 54,8 68,12 82,4 96,1" },
];

const activities = [
  { title: "New task submitted", detail: "Website Deployment · Rohan Sharma", time: "2m ago", tone: "purple", icon: CheckSquare },
  { title: "Attendance marked", detail: "Team Alpha · 4 interns present", time: "18m ago", tone: "teal", icon: CalendarCheck },
  { title: "Meeting scheduled", detail: "Project Review · Tomorrow, 11:00 AM", time: "1h ago", tone: "blue", icon: CalendarDays },
];

const meetings = [
  { day: "10", month: "NOV", title: "Project Review Meeting", detail: "11:00 AM – 12:00 PM", people: "All interns" },
  { day: "11", month: "NOV", title: "Team Alpha Sync", detail: "3:00 PM – 3:30 PM", people: "Team Alpha" },
  { day: "13", month: "NOV", title: "Individual Feedback", detail: "10:30 AM – 11:00 AM", people: "Selected interns" },
];

const performers = [
  ["01", "Rohan Sharma", "98%"],
  ["02", "Priya Shah", "96%"],
  ["03", "Aarav Patel", "94%"],
  ["04", "Sneha Verma", "92%"],
  ["05", "Aditya Singh", "90%"],
];

export function DashboardShell() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(true);\n\n  useEffect(() => {\n    fetch("/api/v1/dashboard").then((response) => { if (!response.ok) throw new Error("Unable to load dashboard"); return response.json(); }).then((data: DashboardData) => setDashboard(data)).catch(() => setDashboard(null));\n  }, []);

  return (
    <main className={dark ? "app-shell" : "app-shell light-mode"}>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><span>AI</span></div>
          <div className="brand-copy"><strong>AI ASESRO</strong><span>Intern<span className="gradient-text">Hub</span></span></div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {nav.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => { setActive(label); setMenuOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-item ${active === "Settings" ? "active" : ""}`} onClick={() => setActive("Settings")}><Settings size={18}/><span>Settings</span></button>
          <div className="profile-mini">
            <div className="avatar">H</div>
            <div><strong>Harsh Desai</strong><span>Administrator</span></div>
            <ChevronDown size={15} className="muted-icon"/>
          </div>
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
            <div className="avatar avatar-top">H</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="hero-banner">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot"/> INTERNSHIP OPERATIONS</div>
              <h1>Welcome back, Harsh <span className="wave">✦</span></h1>
              <p>Here’s what’s happening with your internship program today.</p>
            </div>
            <div className="hero-brand">
              <div className="hero-brand-name">AI ASESRO <strong>Intern<span>Hub</span></strong></div>
              <p>Learn <b>·</b> Contribute <b>·</b> Grow</p>
            </div>
            <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          </section>

          <div className="section-heading"><div><span className="eyebrow">OVERVIEW</span><h2>Program snapshot</h2></div><span className="date-chip">Monday, 9 November 2026</span></div>

          <section className="metric-grid">
            {metrics.map(({ label, value, change, icon: Icon, tone, points }) => (
              <article className="metric-card" key={label}>
                <div className={`metric-icon ${tone}`}><Icon size={21}/></div>
                <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{change}</small></div>
                <svg className="sparkline" viewBox="0 0 96 30" role="img" aria-label="Trend rising"><polyline points={points}/></svg>
              </article>
            ))}
          </section>

          <section className="middle-grid">
            <article className="panel performance-panel">
              <div className="panel-heading"><div><span className="eyebrow">THIS MONTH</span><h3>Intern performance</h3></div><button className="text-link">View report <span>↗</span></button></div>
              <div className="performance-content">
                <div className="donut-wrap"><div className="donut"><div><strong>92%</strong><span>Overall score</span></div></div></div>
                <div className="legend-list">
                  <div><i className="legend-dot cyan"/> <span>Task completion</span><strong>92%</strong></div>
                  <div><i className="legend-dot purple-dot"/> <span>Attendance</span><strong>96%</strong></div>
                  <div><i className="legend-dot blue-dot"/> <span>Timely submissions</span><strong>90%</strong></div>
                </div>
              </div>
            </article>

            <article className="panel activity-panel">
              <div className="panel-heading"><div><span className="eyebrow">LIVE FEED</span><h3>Recent activity</h3></div><button className="text-link">View all <span>↗</span></button></div>
              <div className="activity-list">
                {dashboard?.activities.length ? dashboard.activities.map((activity) => <div className="activity-row" key={activity.id}><div className={`activity-icon ${activity.tone}`}>{activity.kind === "submission" ? <CheckSquare size={17}/> : <CalendarCheck size={17}/>}</div><div className="activity-copy"><strong>{activity.title}</strong><span>{activity.detail}</span></div><time>{new Date(activity.time).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time></div>) : <p className="empty-state">{dashboard ? "No recent activity yet." : "Loading recent activity..."}</p>}
              </div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel performers-panel">
              <div className="panel-heading"><div><span className="eyebrow">RECOGNITION</span><h3>Top performers</h3></div><button className="text-link">View details <span>↗</span></button></div>
              <div className="performer-list">
                <p className="empty-state">Performance rankings will appear once interns have task and attendance records.</p>
              </div>
            </article>
            <article className="panel meetings-panel">
              <div className="panel-heading"><div><span className="eyebrow">YOUR CALENDAR</span><h3>Upcoming meetings</h3></div><button className="text-link">View calendar <span>↗</span></button></div>
              <div className="meeting-list">
                {dashboard?.upcomingMeetings.length ? dashboard.upcomingMeetings.map((meeting) => <div className="meeting-row" key={meeting.id}><div className="meeting-date"><strong>{meeting.day}</strong><span>{meeting.month}</span></div><div className="meeting-copy"><strong>{meeting.title}</strong><span>{meeting.detail} · {meeting.people}</span></div><span className="status-pill">Upcoming</span></div>) : <p className="empty-state">{dashboard ? "No upcoming meetings scheduled." : "Loading meetings..."}</p>}
              </div>
            </article>
          </section>
          <footer className="footer"><span>© 2026 AI ASESRO InternHub. All rights reserved.</span><span>Built with <b>♥</b> by AI ASESRO</span></footer>
        </div>
      </section>
    </main>
  );
}
