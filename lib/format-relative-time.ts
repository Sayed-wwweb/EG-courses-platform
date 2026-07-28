const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Formats a past date as a short relative string, e.g. "2 days ago", "1 year ago".
 * Mirrors the style YouTube uses under a video title.
 */
export function formatRelativeTime(date: Date): string {
  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return relativeTimeFormatter.format(Math.round(duration), "years");
}

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Formats a date as e.g. "26 Jul 2026" — used where the exact date matters, not a relative estimate. */
export function formatFullDate(date: Date): string {
  return fullDateFormatter.format(date);
}