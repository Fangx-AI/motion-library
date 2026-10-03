import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import {
  IconSearch,
  IconPlayerPlayFilled,
  IconX,
  IconMenu2,
  IconArrowUpRight,
  IconCode,
  IconCopy,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  Navbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
} from "./components/ui/resizable-navbar";
import { GalleryHoverEffect } from "./components/ui/gallery-hover-effect";
import { CategoryTabs } from "./components/ui/category-tabs";
import { AnimatedDialog } from "./components/ui/animated-dialog";
import {
  selectWorks,
  hasOriginal,
  hasCode,
  duration,
  type Work,
  type Mode,
} from "./library-model";

const PROJECT = "https://github.com/Fangx-AI/motion-library";
const UPSTREAM = "https://github.com/guanmo-ai/awesome-ai-motion";
const modeLabels: { [key in Mode]: string } = {
  all: "全部作品",
  prompt: "提示词正文",
  code: "源码",
};
function params() {
  return new URLSearchParams(location.search);
}
function updateUrl(patch: Record<string, string | null>) {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(patch))
    v ? url.searchParams.set(k, v) : url.searchParams.delete(k);
  history.replaceState(null, "", url);
}
function Link({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={/^https:\/\//.test(href || "") ? href : undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
function Brand() {
  return (
    <a className="brand" href="./">
      <span className="brand-mark" aria-hidden="true">
        m.
      </span>
      <span>Motion Library</span>
    </a>
  );
}
function Header() {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);
  return (
    <Navbar className="site-navbar fixed top-4">
      <NavBody className="nav-body">
        <Brand />
        <nav className="header-links" aria-label="主导航">
          <a href="#library">作品库</a>
          <a href="#sources">关于收录</a>
          <Link href={PROJECT}>
            GitHub
            <IconArrowUpRight size={14} />
          </Link>
        </nav>
      </NavBody>
      <MobileNav className="mobile-nav">
        <MobileNavHeader>
          <Brand />
          <button
            className="mobile-toggle"
            aria-label={menu ? "关闭导航" : "打开导航"}
            aria-expanded={menu}
            aria-controls="mobile-links"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={menu}
          onClose={() => setMenu(false)}
          className="mobile-menu"
        >
          <nav id="mobile-links" aria-label="手机导航">
            <a href="#library" onClick={() => setMenu(false)}>
              作品库
            </a>
            <a href="#sources" onClick={() => setMenu(false)}>
              关于收录
            </a>
            <Link href={PROJECT}>GitHub</Link>
          </nav>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
function Cover({ work }: { work: Work }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="cover-fallback">
      {work.title}
      <small>封面暂不可用</small>
    </span>
  ) : (
    <img
      src={work.cover}
      alt={work.title}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
function Prompt({ work }: { work: Work }) {
  const p = work.prompt;
  const [copied, setCopied] = useState(false),
    [message, setMessage] = useState("");
  const original = p.status === "original";
  const text = p.text?.trim();
  async function copy() {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setMessage("原文已复制");
      setTimeout(() => {
        setCopied(false);
        setMessage("");
      }, 2000);
    } catch {
      setMessage("请选中下方正文复制");
    }
  }
  return (
    <section
      className="prompt-panel"
      id="prompt-content"
      aria-labelledby="prompt-heading"
    >
      <div className="section-label">
        <div>
          <h3 id="prompt-heading">
            {original
              ? "作者提示词"
              : p.status === "brief"
                ? "任务描述"
                : "提示词"}
          </h3>
          {p.status === "brief" && <p>作者对任务的描述，非完整提示词。</p>}
        </div>
        {text && (
          <button
            className="copy-prompt"
            onClick={copy}
            aria-label={original ? "复制作者提示词" : "复制任务描述"}
          >
            {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
            <span>{copied ? "已复制" : "复制原文"}</span>
          </button>
        )}
      </div>
      {text ? (
        <pre className="prompt-text" tabIndex={0}>
          {text}
        </pre>
      ) : (
        <p className="prompt-missing">
          {p.status === "unknown"
            ? "暂未收录公开提示词。"
            : "仅有原文来源，暂未收录正文。"}
        </p>
      )}
      {p.translationZh?.trim() && (
        <details className="prompt-translation">
          <summary>中文译文</summary>
          <pre className="prompt-text" tabIndex={0}>
            {p.translationZh}
          </pre>
          <small>译文来自参考库，以原文为准。</small>
        </details>
      )}
      {p.noteZh && <p className="prompt-note">{p.noteZh}</p>}
      <div className="prompt-source">
        <Link href={p.sourceUrl || work.source}>
          原文来源
          <IconArrowUpRight size={13} />
        </Link>
        <span role="status" aria-live="polite">
          {message}
        </span>
      </div>
    </section>
  );
}
function Detail({
  work,
  initialSection,
}: {
  work: Work;
  initialSection: string;
}) {
  const [failed, setFailed] = useState(false),
    [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setFailed(true);
      setLoading(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    if (!initialSection) {
      document.querySelector<HTMLDialogElement>("dialog")?.scrollTo({ top: 0 });
      return;
    }
    const t = requestAnimationFrame(() =>
      document
        .getElementById(initialSection)
        ?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(t);
  }, [initialSection]);
  return (
    <>
      <div className="detail-intro">
        <div className="detail-kicker">
          {work.category}
          <span>{duration(work.duration)}</span>
        </div>
        <h2 id="detail-title">{work.title}</h2>
        <div className="detail-byline">
          <Link href={work.author.url}>@{work.author.handle}</Link>
          <span>{work.date.slice(0, 10)}</span>
          <span>{work.model || "模型未标明"}</span>
        </div>
      </div>
      <div className="detail-media-wrap">
        {work.video ? (
          <video
            controls
            playsInline
            preload="none"
            className="detail-media"
            poster={work.cover}
            src={work.video}
            onLoadStart={() => setLoading(true)}
            onLoadedData={() => {
              setLoading(false);
              setFailed(false);
            }}
            onPlaying={() => {
              setLoading(false);
              setFailed(false);
            }}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
          />
        ) : (
          <img className="detail-media" src={work.cover} alt={work.title} />
        )}
      </div>
      {(failed || !work.video) && (
        <p className="media-status">
          {failed ? "外部视频加载失败。" : "页内视频暂不可用。"}
          <Link href={work.source}>
            前往作者原帖观看
            <IconArrowUpRight size={13} />
          </Link>
        </p>
      )}
      <div className="detail-body">
        <p className="work-summary">{work.summary}</p>
        <div className="detail-jump">
          <Link href={work.source}>
            作者原帖
            <IconArrowUpRight size={14} />
          </Link>
          {hasOriginal(work) && (
            <a
              href="#prompt-content"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("prompt-content")
                  ?.scrollIntoView({ block: "start", behavior: "smooth" });
              }}
            >
              读提示词
            </a>
          )}
          {work.resources.length > 0 && (
            <a
              href="#resources-content"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("resources-content")
                  ?.scrollIntoView({ block: "start", behavior: "smooth" });
              }}
            >
              制作资料
            </a>
          )}
        </div>
        {work.resources.length > 0 && (
          <section className="resource-list" id="resources-content">
            <h3>制作资料</h3>
            {work.resources.map((r, i) => (
              <div className="resource-item" key={i}>
                <div className="resource-kind">
                  {r.kind === "code"
                    ? "源码"
                    : r.kind === "demo"
                      ? "作品网页"
                      : "相关工具"}
                </div>
                <div>
                  <Link href={r.url}>
                    {r.label || "查看资料"}
                    <IconArrowUpRight size={14} />
                  </Link>
                  {r.license && (
                    <small>
                      许可：
                      {r.license === "not_specified" ? "未标明" : r.license}
                    </small>
                  )}
                  {r.note && <p>{r.note}</p>}
                </div>
              </div>
            ))}
          </section>
        )}
        <Prompt work={work} />
        <p className="detail-attribution">
          作品归原作者所有。资料整理自{" "}
          <Link href={UPSTREAM}>Awesome AI Motion</Link>
          ；公开指令不保证复现结果。
        </p>
      </div>
    </>
  );
}
function App() {
  const [works, setWorks] = useState<Work[]>([]),
    [error, setError] = useState(false);
  const [query, setQuery] = useState(() => params().get("q") || ""),
    [category, setCategory] = useState(
      () => params().get("category") || "全部",
    ),
    [mode, setMode] = useState<Mode>(() =>
      ["prompt", "code"].includes(params().get("type") || "")
        ? (params().get("type") as Mode)
        : "all",
    ),
    [sort, setSort] = useState(() => params().get("sort") || "editorial"),
    [limit, setLimit] = useState(24),
    [active, setActive] = useState<Work | null>(null),
    [detailSection, setDetailSection] = useState("");
  const search = useRef<HTMLInputElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    fetch("works.json")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data: Work[]) => {
        setWorks(data);
        const w = data.find((w) => w.id === params().get("work"));
        if (w) setActive(w);
      })
      .catch(() => setError(true));
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !document.querySelector("dialog[open]") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    setLimit(24);
    updateUrl({
      q: query || null,
      category: category === "全部" ? null : category,
      type: mode === "all" ? null : mode,
      sort: sort === "editorial" ? null : sort,
    });
  }, [query, category, mode, sort]);
  const selected = useMemo(
    () => selectWorks(works, { mode, category, query, sort }),
    [works, mode, category, query, sort],
  );
  const categoryCounts = useMemo(() => {
    const rows = selectWorks(works, { mode, query });
    return ["全部", ...new Set(works.map((w) => w.category))].map((name) => ({
      name,
      count:
        name === "全部"
          ? rows.length
          : rows.filter((w) => w.category === name).length,
    }));
  }, [works, mode, query]);
  const modeCounts = {
    all: works.length,
    prompt: works.filter(hasOriginal).length,
    code: works.filter(hasCode).length,
  };
  function open(work: Work, section = "") {
    if (!active) returnFocus.current = document.activeElement as HTMLElement;
    setDetailSection(section);
    setActive(work);
    updateUrl({ work: work.id });
  }
  function close() {
    setActive(null);
    setDetailSection("");
    updateUrl({ work: null });
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  function reset() {
    setQuery("");
    setCategory("全部");
    setMode("all");
  }
  const position = active ? selected.findIndex((w) => w.id === active.id) : -1;
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#library">
        跳到作品
      </a>
      <Header />
      <main className="page-main" id="library">
        <div className="library-title">
          <div>
            <h1>动效作品库</h1>
            <p>观看作品，阅读作者提示词，查看制作源码。</p>
          </div>
          <span className="snapshot-label">2026.10 · 内容快照</span>
        </div>
        <div className="resource-modes" aria-label="按创作资料浏览">
          {(["all", "prompt", "code"] as Mode[]).map((key) => (
            <button
              key={key}
              aria-pressed={mode === key}
              onClick={() => {
                setMode(key);
                setCategory("全部");
              }}
            >
              {modeLabels[key]}
              <span>{modeCounts[key] || "—"}</span>
            </button>
          ))}
        </div>
        <div className="toolbar">
          <label className="search-control">
            <IconSearch size={19} aria-hidden="true" />
            <input
              ref={search}
              type="search"
              aria-label="搜索作品、作者或提示词"
              placeholder="搜索作品、作者或提示词"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <label className="sort-control">
            <span className="sr-only">作品排序</span>
            <select
              aria-label="作品排序"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="editorial">浏览顺序</option>
              <option value="popular">收藏最多</option>
              <option value="latest">最新发布</option>
            </select>
          </label>
        </div>
        <CategoryTabs
          tabs={categoryCounts}
          active={category}
          onChange={setCategory}
        />
        <div className="results-bar">
          <p role="status" aria-live="polite">
            {error
              ? "作品加载失败"
              : works.length
                ? `${selected.length} 件作品${query ? " · " + query : ""}`
                : "正在载入作品…"}
          </p>
          <div>
            {(query || category !== "全部") && (
              <button
                className="clear-filters"
                onClick={() => {
                  setQuery("");
                  setCategory("全部");
                }}
              >
                清除筛选
                <IconX size={13} />
              </button>
            )}
            <span>
              {mode === "prompt"
                ? "仅作者原文，排除任务描述"
                : mode === "code"
                  ? "许可见各项目说明"
                  : "点击封面观看作品"}
            </span>
          </div>
        </div>
        {error && (
          <div className="empty-state">
            <p>请检查网络后重试。</p>
            <button onClick={() => location.reload()}>重新载入</button>
          </div>
        )}
        <GalleryHoverEffect
          items={selected.slice(0, limit)}
          renderItem={(w: Work) => (
            <>
              <button
                className="work-cover"
                onClick={() => open(w)}
                aria-label={`查看 ${w.title}`}
              >
                <Cover work={w} />
                <span className="play-icon">
                  <IconPlayerPlayFilled size={14} />
                </span>
                <span className="duration">{duration(w.duration)}</span>
              </button>
              <div className="work-content">
                <span className="work-category">{w.category}</span>
                <h2>
                  <button onClick={() => open(w)}>{w.title}</button>
                </h2>
                <div className="work-byline">
                  <Link href={w.author.url}>@{w.author.handle}</Link>
                </div>
                <div className="work-actions">
                  {hasOriginal(w) && (
                    <button onClick={() => open(w, "prompt-content")}>
                      提示词原文
                      <IconArrowUpRight size={12} />
                    </button>
                  )}
                  {hasCode(w) && (
                    <button onClick={() => open(w, "resources-content")}>
                      <IconCode size={12} />
                      源码
                    </button>
                  )}
                  {!hasOriginal(w) &&
                    !hasCode(w) &&
                    w.prompt.status === "original" && (
                      <span>提示词来源链接</span>
                    )}
                  {!hasOriginal(w) &&
                    !hasCode(w) &&
                    w.prompt.status === "brief" && <span>任务描述</span>}
                  {!hasOriginal(w) &&
                    !hasCode(w) &&
                    w.prompt.status === "unknown" && (
                      <span>原帖与作品资料</span>
                    )}
                </div>
              </div>
            </>
          )}
        />
        {works.length > 0 && !selected.length && (
          <div className="empty-state">
            <h2>没有匹配的作品</h2>
            <p>换个关键词，或查看全部作品。</p>
            <button onClick={reset}>清除筛选</button>
          </div>
        )}
        {selected.length > limit && (
          <div className="load-more">
            <button onClick={() => setLimit((n) => n + 24)}>
              加载更多
              <span>
                {Math.min(limit, selected.length)} / {selected.length}
              </span>
            </button>
          </div>
        )}
      </main>
      <footer id="sources">
        <div>
          <strong>Motion Library</strong>
          <span>作品与资料索引</span>
        </div>
        <p>
          {works.length || 441} 件作品，资料整理自{" "}
          <Link href={UPSTREAM}>观默 / Awesome AI Motion</Link>
          。作品归原作者所有，视频引用外部来源。
        </p>
        <nav aria-label="来源与项目">
          <Link href={PROJECT + "/blob/main/SOURCE.md"}>收录来源</Link>
          <Link href={PROJECT + "/blob/main/THIRD_PARTY.md"}>使用说明</Link>
          <Link href={PROJECT}>GitHub</Link>
        </nav>
      </footer>
      <AnimatedDialog open={!!active} onClose={close}>
        {active && (
          <>
            <Detail
              key={active.id}
              work={active}
              initialSection={detailSection}
            />
            <div className="detail-pagination">
              <button
                disabled={position <= 0}
                onClick={() => open(selected[position - 1])}
              >
                <IconArrowLeft size={15} />
                上一件
              </button>
              <span>
                {position >= 0
                  ? `${position + 1} / ${selected.length}`
                  : "作品详情"}
              </span>
              <button
                disabled={position < 0 || position >= selected.length - 1}
                onClick={() => open(selected[position + 1])}
              >
                下一件
                <IconArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </AnimatedDialog>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
