const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats a count compactly for UI stats, e.g. 1234 -> "1.2K", 999 -> "999". */
export function formatCompactNumber(count: number): string {
  return compactNumberFormatter.format(count);
}