export function formatTimeLabel(raw: string, window: string): string {
  if (!raw) return "";
  if (window === "1D") {
    const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    return match ? match[1] : raw.split(",")[1]?.trim() || raw;
  }
  const dateMatch = raw.match(/([A-Za-z]{3}\s*\d{1,2}(?:,?\s*\d{4})?)/);
  return dateMatch ? dateMatch[1] : raw.split(",")[0] || raw;
}
