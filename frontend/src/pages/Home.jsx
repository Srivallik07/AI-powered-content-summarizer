import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

import { toast } from "react-toastify";
import { summarizeText } from "../services/api";
import { generateLocalSummary } from "../services/localSummarizer";
import SummaryCard from "../components/SummaryCard";
import Loader from "../components/Loader";

// PDF parsing using pdfjs-dist. This extracts text from uploaded PDFs.
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const parsePdfFile = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += `${pageText}\n\n`;
  }
  return fullText;
};

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Home() {
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarySource, setSummarySource] = useState("");
  const [fileName, setFileName] = useState("");

  const handleTextChange = (event) => {
    setOriginalText(event.target.value);
  };

  // PDF parsing is disabled in this dev build to avoid heavy PDF dependency issues.
  // Users can paste text or upload .txt files. Implement PDF parsing later with `pdfjs-dist`.

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const text = await parsePdfFile(file);
        setOriginalText(text);
      } else {
        const text = await file.text();
        setOriginalText(text);
      }
      toast.success("File loaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load file. Please try another text or PDF file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!originalText || originalText.trim().length < 20) {
      toast.error("Please enter at least 20 characters of text.");
      return;
    }

    setLoading(true);
    setSummary(null);
    setSummarySource("");

    try {
      const response = await summarizeText(originalText);
      setSummary(response.data);
      setSummarySource("API");
      toast.success("Summary generated successfully.");
    } catch (error) {
      console.error("API summary failed:", error);
      const local = generateLocalSummary(originalText);
      setSummary(local);
      setSummarySource("Local fallback");
      toast.info("Backend unavailable, summary generated locally.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Summarize your content</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste text or upload a PDF / text file to generate a smart summary.</p>
          </div>
          <div className="inline-flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Word count: <strong>{countWords(originalText)}</strong></span>
            <span className="mx-1">•</span>
            <span>Chars: <strong>{originalText.length}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Enter text or paste your article</label>
            <textarea
              value={originalText}
              onChange={handleTextChange}
              placeholder="Paste a long article, blog, notes, or upload a file..."
              className="mt-2 h-52 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              Select file
              <input type="file" accept=".txt,.pdf" onChange={handleFileChange} className="hidden" />
            </label>
            <span className="text-sm text-slate-500 dark:text-slate-400">{fileName ? `Loaded: ${fileName}` : "Supports .txt and .pdf files."}</span>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Generate summary
            </button>
          </div>
        </form>
      </section>

      {loading && <Loader />}

      {summary && (
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <span>Summary source: <strong>{summarySource || "API"}</strong></span>
              <span className="italic">Generated {summarySource === "Local fallback" ? "locally" : "via backend"}</span>
            </div>
            <SummaryCard title="Short Summary" value={summary.short_summary} />
            <div className="flex gap-3">
              <button
                onClick={() => handleCopy(summary.short_summary)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Copy Short Summary
              </button>
              <button
                onClick={() => handleCopy(summary.bullet_summary)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Copy Bullets
              </button>
            </div>
          </div>
          <div className="space-y-5">
            <SummaryCard title="Bullet Point Summary" value={summary.bullet_summary} />
            <SummaryCard title="Key Highlights" value={summary.highlights} />
          </div>
        </section>
      )}
    </div>
  );
}
