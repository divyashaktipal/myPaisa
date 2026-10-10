import { GoogleGenAI } from "@google/genai";
import { env } from "@/config";

// Cache generated summaries in memory so repeated requests don't burn quota or add latency
const summaryCache = new Map<string, { summary: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

let aiClientInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClientInstance) {
    aiClientInstance = new GoogleGenAI({ apiKey });
  }
  return aiClientInstance;
}

/**
 * Generate a single financial market news summary using Google GenAI SDK (gemini-3.8-flash).
 */
export async function generateGeminiSummary(
  headline: string,
  source = "Market Wire",
  snippet = ""
): Promise<string> {
  const cacheKey = `${headline.trim().toLowerCase()}::${source.trim().toLowerCase()}`;
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.summary;
  }

  const ai = getAIClient();
  if (!ai) {
    return snippet || `${headline} (${source})`;
  }

  const model = env.GEMINI_MODEL || "gemini-3.8-flash";

  const prompt = `You are a financial analyst covering the Indian stock market (NSE / BSE).
Write a factual, professional 1 to 2 sentence summary of this news item highlighting its market significance and corporate impact.
Do NOT use markdown headers, asterisks, or conversational filler. Return only the plain summary text.

Headline: ${headline}
Publisher: ${source}
Context: ${snippet}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 150,
      },
    });

    const generatedText = response.text?.trim?.();
    if (generatedText) {
      summaryCache.set(cacheKey, { summary: generatedText, timestamp: Date.now() });
      return generatedText;
    }
  } catch (err) {
    console.warn(`[Gemini SDK] Summary generation warning (${model}):`, err);
  }

  return snippet || `${headline} (${source})`;
}

/**
 * Batch generate summaries for multiple news items in a single Gemini API request.
 * Saves quota and guarantees low latency for newsroom feeds.
 */
export async function batchGenerateGeminiSummaries(
  items: Array<{ title: string; source: string; snippet?: string }>
): Promise<string[]> {
  if (items.length === 0) return [];

  const ai = getAIClient();
  if (!ai) {
    return items.map((i) => i.snippet || `${i.title} (${i.source})`);
  }

  // Check cache for existing summaries
  const results: (string | null)[] = items.map((item) => {
    const cacheKey = `${item.title.trim().toLowerCase()}::${item.source.trim().toLowerCase()}`;
    const cached = summaryCache.get(cacheKey);
    return cached && Date.now() - cached.timestamp < CACHE_TTL_MS ? cached.summary : null;
  });

  const missingIndices = results
    .map((val, idx) => (val === null ? idx : null))
    .filter((idx): idx is number => idx !== null);

  if (missingIndices.length === 0) {
    return results as string[];
  }

  const model = env.GEMINI_MODEL || "gemini-3.8-flash";

  const promptItems = missingIndices
    .map(
      (idx, pos) =>
        `${pos + 1}. [Source: ${items[idx].source}] Title: "${items[idx].title}" Context: "${items[idx].snippet || ""}"`
    )
    .join("\n");

  const prompt = `You are a financial analyst covering the Indian stock market (NSE / BSE).
For each news item listed below, write a 1 to 2 sentence market summary explaining the corporate or financial impact.
Return ONLY a valid JSON array of strings in the exact same numerical order, with no markdown code fences or backticks.
Items:
${promptItems}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 800,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim?.();
    if (rawText) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleaned);
      }

      if (Array.isArray(parsed)) {
        missingIndices.forEach((origIdx, pos) => {
          const sum =
            typeof parsed[pos] === "string"
              ? parsed[pos].trim()
              : items[origIdx].snippet || items[origIdx].title;
          results[origIdx] = sum;
          const cacheKey = `${items[origIdx].title.trim().toLowerCase()}::${items[origIdx].source.trim().toLowerCase()}`;
          summaryCache.set(cacheKey, { summary: sum, timestamp: Date.now() });
        });
        return results as string[];
      }
    }
  } catch (err) {
    console.warn(`[Gemini SDK] Batch summarization warning (${model}):`, err);
  }

  // If batch call failed or was rate-limited (429), fall back gracefully to item snippets
  missingIndices.forEach((idx) => {
    if (!results[idx]) {
      results[idx] = items[idx].snippet || items[idx].title;
    }
  });

  return results.map((r, i) => r || items[i].snippet || items[i].title);
}
