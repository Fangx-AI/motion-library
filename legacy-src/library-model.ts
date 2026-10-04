export type Resource = {
  kind: string;
  url: string;
  label: string;
  note?: string;
  license?: string;
  licenseUrl?: string;
  evidenceUrl?: string;
  checkedAt?: string;
};
export type Guide = {
  takeawayZh: string;
  stepsZh: string[];
  tools: string[];
  evidenceUrls: string[];
  attribution: string;
};
export type Verification = {
  sourceReadAt?: string;
  authorClaimConfirmed?: boolean;
  videoAttachmentConfirmed?: boolean;
  fullReview?: boolean;
  independentlyReproduced?: boolean;
  promptMatchedSource?: boolean;
};
export type Work = {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: { handle: string; name: string; url: string };
  source: string;
  date: string;
  model: string;
  modelEvidence?: {
    basis?: string;
    evidenceQuote?: string;
    evidenceUrl?: string;
  };
  cover: string;
  duration: number;
  video: string;
  bookmarks: number;
  metricsCheckedAt?: string;
  stage?: string;
  verification?: Verification;
  demoUrl?: string;
  guide?: Guide;
  prompt: {
    status: string;
    sourceUrl: string;
    text?: string;
    translationZh?: string;
    noteZh?: string;
    checkedAt?: string;
    language?: string;
    display?: string;
  };
  resources: Resource[];
};
export type Mode = "all" | "prompt" | "code";
export const startingPoints = [
  "2103918792845963545",
  "2103273003555402193",
  "2104001664793600012",
  "2102786378282987591",
  "2102476258948927543",
  "2103315922098470926",
];
export const hasOriginal = (w: Work) =>
  w.prompt.status === "original" && Boolean(w.prompt.text?.trim());
export const hasCode = (w: Work) => w.resources.some((r) => r.kind === "code");
export const hasDemo = (w: Work) =>
  Boolean(w.demoUrl) || w.resources.some((r) => r.kind === "demo");

function dateTimestamp(value: string) {
  if (typeof value !== "string" || !value.trim()) return NaN;
  // Twitter's public export date is not an ISO date. Parse it explicitly so
  // the result does not depend on a browser's handling of English date text.
  const twitter =
    /^\w{3}\s+(\w{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+([+-])(\d{2})(\d{2})\s+(\d{4})$/.exec(
      value.trim(),
    );
  if (twitter) {
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(twitter[1]);
    const day = Number(twitter[2]),
      hour = Number(twitter[3]),
      minute = Number(twitter[4]),
      second = Number(twitter[5]),
      zoneHour = Number(twitter[7]),
      zoneMinute = Number(twitter[8]),
      year = Number(twitter[9]);
    if (
      month < 0 ||
      day < 1 ||
      hour > 23 ||
      minute > 59 ||
      second > 59 ||
      zoneHour > 23 ||
      zoneMinute > 59
    )
      return NaN;
    const base = Date.UTC(year, month, day, hour, minute, second);
    if (new Date(base).getUTCDate() !== day) return NaN;
    const offset = (zoneHour * 60 + zoneMinute) * 60_000;
    return base - (twitter[6] === "+" ? offset : -offset);
  }
  // Accept date-only and timestamp ISO values, not locale-dependent numbers.
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value.trim());
  if (!iso) return NaN;
  const calendar = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00Z`);
  if (
    calendar.getUTCFullYear() !== Number(iso[1]) ||
    calendar.getUTCMonth() + 1 !== Number(iso[2]) ||
    calendar.getUTCDate() !== Number(iso[3])
  )
    return NaN;
  const text = value.trim();
  const timestamp =
    text.includes("T") && !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)
      ? `${text}Z`
      : text;
  return Date.parse(timestamp);
}

/** Dates refer to the source record; UTC keeps them stable for every visitor. */
export function formatDate(value: string) {
  const stamp = dateTimestamp(value);
  return Number.isFinite(stamp)
    ? new Date(stamp).toISOString().slice(0, 10)
    : "日期未标明";
}
export const duration = (seconds: number) =>
  Number.isFinite(seconds)
    ? `${Math.floor(Math.round(seconds) / 60)}:${String(Math.round(seconds) % 60).padStart(2, "0")}`
    : "—";
export function selectWorks(
  works: Work[],
  {
    mode = "all",
    category = "全部",
    query = "",
    sort = "editorial",
  }: { mode?: Mode; category?: string; query?: string; sort?: string } = {},
) {
  const q = query.trim().toLowerCase();
  const rows = works.filter(
    (w) =>
      (category === "全部" || w.category === category) &&
      (mode !== "prompt" || hasOriginal(w)) &&
      (mode !== "code" || hasCode(w)) &&
      (!q ||
        [
          w.title,
          w.summary,
          w.author.name,
          w.author.handle,
          w.model,
          w.prompt.text,
          w.prompt.translationZh,
          w.prompt.noteZh,
          w.guide?.takeawayZh,
          ...(w.guide?.stepsZh || []),
          ...(w.guide?.tools || []),
          ...w.resources.flatMap((r) => [r.label, r.note, r.license]),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  return rows.sort((a, b) => {
    if (sort === "latest") {
      const time = (w: Work) => {
        const stamp = dateTimestamp(w.date);
        return Number.isFinite(stamp) ? stamp : 0;
      };
      return time(b) - time(a);
    }
    if (sort === "popular") return b.bookmarks - a.bookmarks;
    const rank = (w: Work) => {
      const idx = startingPoints.indexOf(w.id);
      return idx < 0 ? 1000 : idx;
    };
    return (
      rank(a) - rank(b) ||
      Number(hasOriginal(b)) - Number(hasOriginal(a)) ||
      Number(hasCode(b)) - Number(hasCode(a)) ||
      b.bookmarks - a.bookmarks
    );
  });
}
