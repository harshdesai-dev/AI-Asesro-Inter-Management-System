export const APP_NAME = "AI ASESRO InternHub";

export const NAVIGATION = [
  { label: "Dashboard", href: "/", icon: "layout-dashboard" },
  { label: "Intern Management", href: "/interns", icon: "users" },
  { label: "Team Management", href: "/teams", icon: "users-round" },
  { label: "Task Management", href: "/tasks", icon: "clipboard-list" },
  { label: "Attendance", href: "/attendance", icon: "calendar-check" },
  { label: "Meeting Management", href: "/meetings", icon: "calendar-days" },
  { label: "Performance", href: "/performance", icon: "chart-no-axes-combined" },
] as const;
