import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchHistory, deleteSummary } from "../services/api";
import SummaryCard from "../components/SummaryCard";

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchHistory();
      setHistory(response.data.history || []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSummary(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast.success("Summary deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete summary.");
    }
  };

  const filteredHistory = history.filter((item) => {
    const text = `${item.original_text} ${item.short_summary} ${item.bullet_summary} ${item.highlights}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Summary history</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search or remove past summaries you generated.</p>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search history..."
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700 sm:w-80"
          />
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-300">Loading history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-center text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          No saved summaries yet. Generate a summary first.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredHistory.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Saved on {new Date(item.created_at).toLocaleString()}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Summary #{item.id.slice(-6)}</h3>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
              <div className="mt-5 space-y-4">
                <SummaryCard title="Short Summary" value={item.short_summary} />
                <SummaryCard title="Bullet Summary" value={item.bullet_summary} />
                <SummaryCard title="Highlights" value={item.highlights} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
