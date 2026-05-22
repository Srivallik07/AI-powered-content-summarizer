import os
import re
import requests
from collections import Counter

raw_gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
if raw_gemini_key.startswith("gsk_") and not GROQ_API_KEY:
    GROQ_API_KEY = raw_gemini_key
    GEMINI_API_KEY = ""
else:
    GEMINI_API_KEY = raw_gemini_key
MODEL_NAME = os.getenv("MODEL_NAME", "text-bison-001")
GROQ_MODEL = os.getenv("GROQ_MODEL", "gpt-4o-mini")
API_URL = f"https://generativelanguage.googleapis.com/v1beta2/models/{MODEL_NAME}:generate"
GROQ_API_URL = f"https://api.groq.ai/v1/models/{GROQ_MODEL}/generate"

PROMPT_TEMPLATE = (
    "You are a helpful summarization assistant. "
    "Please produce the following from the given content:\n"
    "1. A concise short summary.\n"
    "2. A bullet point summary.\n"
    "3. A list of the most important highlights.\n"
    "Do not include any extra text labels beyond the answers.\n"
    "Return results in JSON-like separated sections: SHORT_SUMMARY:, BULLET_SUMMARY:, HIGHLIGHTS:.\n"
    "Content:\n{content}"
)

STOPWORDS = {
    "the", "and", "a", "an", "of", "to", "in", "for", "on", "with", "as", "at", "by", "is", "it",
    "this", "that", "these", "those", "be", "or", "from", "was", "are", "were", "has", "have", "had",
    "but", "not", "which", "its", "their", "they", "we", "our", "us", "you", "your",
}


def summarize_with_rules(text: str) -> dict:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()]
    if not sentences:
        return {"short_summary": "", "bullet_summary": "", "highlights": ""}

    words = [w.lower() for w in re.findall(r"\b[a-zA-Z0-9']+\b", text) if w.lower() not in STOPWORDS]
    freq = Counter(words)
    most_common = [word for word, count in freq.most_common(8)]

    sentence_scores = []
    for sentence in sentences:
        score = sum(freq.get(word.lower(), 0) for word in re.findall(r"\b[a-zA-Z0-9']+\b", sentence))
        sentence_scores.append((score, sentence))

    sentence_scores.sort(reverse=True, key=lambda item: item[0])
    top_sentences = [s for _, s in sentence_scores[:3]]
    top_sentences_in_order = [s for s in sentences if s in top_sentences]

    short_summary = " ".join(top_sentences_in_order[:3])
    bullet_summary = "\n".join([f"• {s}" for s in top_sentences_in_order[:5]])
    highlights = ", ".join(most_common[:6])

    if not short_summary:
        short_summary = sentences[0]
    if not bullet_summary:
        bullet_summary = "\n".join([f"• {sent}" for sent in sentences[:3]])
    if not highlights:
        highlights = ", ".join(words[:5])

    return {
        "short_summary": short_summary,
        "bullet_summary": bullet_summary,
        "highlights": highlights,
    }


def generate_groq_summary(text: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(content=text)
    payload = {
        "input": prompt,
        "temperature": 0.2,
        "max_output_tokens": 700,
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    output_text = ""
    for item in data.get("outputs", []):
        if item.get("type") == "output_text":
            output_text += item.get("text", "")
    if not output_text:
        raise RuntimeError("No response from Groq API")
    return parse_gemini_output(output_text)


def generate_google_summary(text: str) -> dict:
    prompt = PROMPT_TEMPLATE.format(content=text)
    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.2,
        "maxOutputTokens": 700,
    }
    headers = {"Content-Type": "application/json"}
    response = requests.post(f"{API_URL}?key={GEMINI_API_KEY}", json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    candidates = data.get("candidates") or []
    output = candidates[0].get("output") if candidates else data.get("output", "")
    if not output:
        raise RuntimeError("No response from Gemini API")
    return parse_gemini_output(output)


def generate_summary(text: str) -> dict:
    if GROQ_API_KEY:
        try:
            return generate_groq_summary(text)
        except Exception:
            return summarize_with_rules(text)
    if GEMINI_API_KEY:
        try:
            return generate_google_summary(text)
        except Exception:
            return summarize_with_rules(text)
    return summarize_with_rules(text)


def parse_gemini_output(output: str) -> dict:
    result = {
        "short_summary": "",
        "bullet_summary": "",
        "highlights": "",
    }
    lower = output.lower()
    if "short_summary:" in lower or "bullet_summary:" in lower or "highlights:" in lower:
        sections = {}
        last_key = None
        for line in output.splitlines():
            if not line.strip():
                continue
            key = None
            if line.strip().lower().startswith("short_summary:"):
                key = "short_summary"
                text = line.split(":", 1)[1].strip()
            elif line.strip().lower().startswith("bullet_summary:"):
                key = "bullet_summary"
                text = line.split(":", 1)[1].strip()
            elif line.strip().lower().startswith("highlights:"):
                key = "highlights"
                text = line.split(":", 1)[1].strip()
            else:
                text = line.strip()
            if key:
                sections[key] = text
                last_key = key
            elif last_key:
                sections[last_key] += "\n" + text
        result.update({k: sections.get(k, "") for k in result})
    else:
        result["short_summary"] = output.strip()
        result["bullet_summary"] = output.strip()
        result["highlights"] = output.strip()
    return result
