export default function SummaryCard({ title, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{value || "No content available."}</div>
    </article>
  );
}
