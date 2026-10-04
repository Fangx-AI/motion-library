export type Resource = {
  kind: string;
  url: string;
  label: string;
  note?: string;
  license?: string;
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
  cover: string;
  duration: number;
  video: string;
  bookmarks: number;
  prompt: {
    status: string;
    sourceUrl: string;
    text?: string;
    translationZh?: string;
    noteZh?: string;
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
          ...w.resources.map((r) => r.label),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  return rows.sort((a, b) => {
    if (sort === "latest") return +new Date(b.date) - +new Date(a.date);
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
