import Link from "next/link";
import { ArrowLeft, CalendarCheck, CalendarDays, CheckSquare } from "lucide-react";

type RecordItem = { id: string; title: string; detail: string; status?: string };

export function InternRecords({ title, description, items, kind }: { title: string; description: string; items: RecordItem[]; kind: "tasks" | "attendance" | "meetings" }) {
  const Icon = kind === "tasks" ? CheckSquare : kind === "attendance" ? CalendarCheck : CalendarDays;
  return (
    <main className="records-screen">
      <header className="records-top"><Link href="/intern"><ArrowLeft size={16}/> Back to dashboard</Link><span className="eyebrow">AI ASESRO INTERNHUB</span></header>
      <section className="records-content">
        <span className="eyebrow">MY WORKSPACE</span><h1>{title}</h1><p>{description}</p>
        <div className="records-panel">
          {items.length ? items.map((item) => <article className="record-item" key={item.id}><div className="activity-icon blue"><Icon size={18}/></div><div className="record-copy"><strong>{item.title}</strong><span>{item.detail}</span></div>{item.status && <span className="status-pill">{item.status.replaceAll("_"," ")}</span>}</article>) : <div className="empty-state">Nothing to show here yet.</div>}
        </div>
      </section>
    </main>
  );
}
