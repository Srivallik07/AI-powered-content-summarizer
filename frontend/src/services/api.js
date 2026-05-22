import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({
  baseURL: `${baseUrl}`,
  headers: { "Content-Type": "application/json" },
});

export function summarizeText(originalText) {
  return api.post("/summarize", { original_text: originalText });
}

export function fetchHistory() {
  return api.get("/history");
}

export function deleteSummary(id) {
  return api.delete("/history", { data: { summary_id: id } });
}
