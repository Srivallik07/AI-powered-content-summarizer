const STOPWORDS = new Set([
  "the", "and", "a", "an", "of", "to", "in", "for", "on", "with", "as", "at", "by", "is", "it",
  "this", "that", "these", "those", "be", "or", "from", "was", "are", "were", "has", "have", "had",
  "but", "not", "which", "its", "their", "they", "we", "our", "us", "you", "your",
]);

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]?/g) || [text.trim()];
}

function getWords(text) {
  return (text.match(/\b[a-zA-Z0-9']+\b/g) || []).map((word) => word.toLowerCase());
}

export function generateLocalSummary(text) {
  const content = text.trim();
  if (!content) {
    return {
      short_summary: "",
      bullet_summary: "",
      highlights: "",
    };
  }

  const sentences = splitSentences(content);
  const words = getWords(content).filter((word) => !STOPWORDS.has(word));
  const frequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  const sentenceScores = sentences.map((sentence) => {
    const sentenceWords = getWords(sentence);
    const score = sentenceWords.reduce((sum, word) => sum + (frequency[word] || 0), 0);
    return { sentence: sentence.trim(), score };
  });

  sentenceScores.sort((a, b) => b.score - a.score);
  const topSentences = sentenceScores.slice(0, 3).map((item) => item.sentence).filter(Boolean);
  const shortSummary = topSentences.length > 0 ? topSentences.join(" ") : sentences.slice(0, 2).join(" ");
  const bulletSummary = (topSentences.length > 0 ? topSentences : sentences.slice(0, 3))
    .map((sentence) => `• ${sentence}`)
    .join("\n");

  const sortedWords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
  const highlights = sortedWords.join(", ");

  return {
    short_summary: shortSummary,
    bullet_summary: bulletSummary,
    highlights,
  };
}
