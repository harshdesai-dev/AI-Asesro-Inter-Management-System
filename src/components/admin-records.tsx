import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type AdminRecord = { id: string; primary: string; secondary: string; status: string; extra?: string; actionUrl?: string; actionLabel?: string };

export function AdminRecords({ title, description, records, emptyText = "No records found." }: { title: string; description: string; records: AdminRecord[]; emptyText?: string }) {
  return (
    <main className="records-screen">
      <header className="records-top"><Link href="/"><ArrowLeft size={16}/> Back to dashboard</Link><span className="eyebrow">AI ASESRO INTERNHUB · ADMIN</span></header>
      <section className="records-content">
        <span className="eyebrow">MANAGEMENT</span><h1>{title}</h1><p>{description}</p>
        <div className="records-panel admin-records">
          <div className="admin-record-head"><span>NAME / TITLE</span><span>DETAILS</span><span>STATUS</span></div>
          {records.length ? records.map((record) => <article className="record-item" key={record.id}><div className="record-copy"><strong>{record.primary}</strong><span>{record.secondary}</span></div><div className="record-extra">{record.extra ?? "—"}</div><div className="record-actions">{record.actionUrl && <Link className="record-action-link" href={record.actionUrl}>{record.actionLabel ?? "Open"}</Link>}<span className="status-pill">{record.status.replaceAll("_"," ")}</span></div></article>) : <div className="empty-state">{emptyText}</div>}
        </div>
      </section>
    </main>
  );
}
