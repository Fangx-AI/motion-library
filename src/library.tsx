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
  IconWorld,
  IconBook2,
  IconPlayerPause,
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
import { BentoGrid } from "./components/ui/bento-grid";
import {
  selectWorks,
  hasOriginal,
  hasCode,
  hasDemo,
  formatDate,
  duration,
  type Work,
  type Mode,
} from "./library-model";
import { featuredCases, type FeaturedCase } from "./editorial";

const PROJECT = "https://github.com/Fangx-AI/motion-library";
const UPSTREAM = "https://github.com/guanmo-ai/awesome-ai-motion";
const modeLabels: Record<Mode, string> = {
  all: "全部作品",
  prompt: "作者提示词",
  code: "附源码",
};
const params = () => new URLSearchParams(location.search);
function updateUrl(patch: Record<string, string | null>, push = false) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(patch))
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  if (push) history.pushState({ motionWork: true }, "", url);
  else history.replaceState(history.state, "", url);
}
function Link({
  href,
  children,
  className,
  ...props
}: { href: string; children: React.ReactNode; className?: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return (
    <a
      href={/^https:\/\//.test(href || "") ? href : undefined}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
function Brand() {
  return (
    <a className="brand" href="./" aria-label="Motion Library 首页">
      <span className="brand-mark" aria-hidden="true">
        m.
      </span>
      <span>Motion Library</span>
    </a>
  );
}
function Header({ search }: { search: () => void }) {
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
    <Navbar className="site-navbar">
      <NavBody className="nav-body">
        <Brand />
        <nav className="header-links" aria-label="主导航">
          <a href="#selected">编辑选读</a>
          <a href="#library">作品库</a>
          <button onClick={search}>
            <IconSearch size={16} />
            搜索<span className="key-hint">/</span>
          </button>
          <Link href={PROJECT} className="github-link">
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
            {menu ? <IconX size={21} /> : <IconMenu2 size={21} />}
          </button>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={menu}
          onClose={() => setMenu(false)}
          className="mobile-menu"
        >
          <nav id="mobile-links" aria-label="手机导航">
            <a href="#selected" onClick={() => setMenu(false)}>
              编辑选读
            </a>
            <a href="#library" onClick={() => setMenu(false)}>
              作品库
            </a>
            <button
              onClick={() => {
                setMenu(false);
                search();
              }}
            >
              搜索作品
            </button>
            <Link href={PROJECT}>
              GitHub
              <IconArrowUpRight size={16} />
            </Link>
          </nav>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
function Cover({ work, eager = false }: { work: Work; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="cover-fallback">
      {work.title}
      <small>封面暂不可用，仍可查看作者资料。</small>
    </span>
  ) : (
    <img
      src={work.cover}
      alt={work.title}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
function PreviewCover({
  work,
  eager = false,
  autoPreview = false,
  hoverPreview = true,
  className,
  label,
  onClick,
}: {
  work: Work;
  eager?: boolean;
  autoPreview?: boolean;
  hoverPreview?: boolean;
  className: string;
  label: string;
  onClick: () => void;
}) {
  const [preview, setPreview] = useState(false),
    [ready, setReady] = useState(false);
  const cover = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!autoPreview || !work.video || motion.matches) {
      setPreview(false);
      setReady(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setPreview(entry.isIntersecting);
        if (!entry.isIntersecting) setReady(false);
      },
      { threshold: 0.25 },
    );
    if (cover.current) observer.observe(cover.current);
    const stopMotion = () => {
      if (motion.matches) {
        setPreview(false);
        setReady(false);
      }
    };
    motion.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", stopMotion);
    };
  }, [autoPreview, work.video]);
  const stop = () => {
    setPreview(false);
    setReady(false);
  };
  return (
    <button
      ref={cover}
      className={className}
      aria-label={label}
      onClick={() => {
        stop();
        onClick();
      }}
      onPointerEnter={() => {
        if (
          hoverPreview &&
          work.video &&
          matchMedia("(hover: hover) and (pointer: fine)").matches &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          setPreview(true);
      }}
      onPointerLeave={() => {
        if (!autoPreview) stop();
      }}
    >
      <Cover work={work} eager={eager} />
      {preview && (
        <video
          className={`cover-preview ${ready ? "is-ready" : ""}`}
          src={work.video}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onLoadedData={() => setReady(true)}
          onError={stop}
        />
      )}
      <span className="cover-play">
        <IconPlayerPlayFilled size={15} />
        {!ready && <span>观看效果</span>}
      </span>
      <span className="cover-duration">{duration(work.duration)}</span>
    </button>
  );
}
function SearchField({
  value,
  onChange,
  inputRef,
  hero = false,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  hero?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <form
      className={`search-field ${hero ? "intro-search" : ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <IconSearch size={19} aria-hidden="true" />
      <input
        type="search"
        ref={inputRef}
        aria-label={hero ? "搜索动效参考" : "搜索作品、作者或提示词"}
        placeholder={
          hero ? "搜索效果、作者、制作方式" : "搜索作品、作者或提示词"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hero ? (
        <button aria-label="查看搜索结果" type="submit">
          <IconArrowRight size={18} />
        </button>
      ) : (
        <kbd aria-hidden="true">/</kbd>
      )}
    </form>
  );
}
function Study({
  work,
  entry,
  index,
  preview,
  open,
}: {
  work: Work;
  entry: FeaturedCase;
  index: number;
  preview: boolean;
  open: (work: Work, section?: string) => void;
}) {
  return (
    <article className="study-card">
      <PreviewCover
        work={work}
        eager
        autoPreview={preview && index === 0}
        hoverPreview={preview}
        className="study-cover"
        label={`观看精选作品：${work.title}`}
        onClick={() => open(work)}
      />
      <div className="study-body">
        <div className="study-kicker">
          <span>{entry.kicker}</span>
          <span className="study-index">0{index + 1}</span>
        </div>
        <h3>
          <button onClick={() => open(work)}>
            {index === 0
              ? "Clearwater · 交互水面"
              : index === 1
                ? "像素巫师 · 施法循环"
                : "一个形状，串起整套 UI"}
          </button>
        </h3>
        <p>
          {index === 0
            ? "实时折射与点击涟漪，附 WebGL2 源码。"
            : index === 1
              ? "128 × 96 画布、角色状态与粒子更新规格。"
              : "逐拍形变、时间函数与循环检查指令。"}
        </p>
        <div className="study-footer">
          <Link href={work.author.url}>@{work.author.handle}</Link>
          <button
            onClick={() =>
              open(work, index === 0 ? "resources-content" : "prompt-content")
            }
          >
            {index === 0 ? "演示与源码" : "读作者指令"}
            <IconArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
function Intro({
  works,
  query,
  setQuery,
  open,
  showResults,
  modalOpen,
}: {
  works: Work[];
  query: string;
  setQuery: (q: string) => void;
  open: (work: Work, section?: string) => void;
  showResults: () => void;
  modalOpen: boolean;
}) {
  const [previews, setPreviews] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  return (
    <section className="intro" id="selected" aria-labelledby="intro-title">
      <div className="intro-heading">
        <div>
          <p className="eyebrow">动效参考 / 制作资料</p>
          <h1 id="intro-title">
            动效作品与制作资料<span>。</span>
          </h1>
          <p className="intro-description">浏览原作，按作者指令与源码查找。</p>
        </div>
        <div className="intro-search-wrap">
          <SearchField
            hero
            value={query}
            onChange={setQuery}
            onSubmit={showResults}
          />
          <p>{works.length || 441} 件作品 · 标明原文与资料来源</p>
        </div>
      </div>
      <div className="selection-heading">
        <h2>从这三件开始</h2>
        <button
          className="preview-toggle"
          aria-pressed={previews}
          onClick={() => setPreviews(!previews)}
        >
          {previews ? (
            <IconPlayerPause size={14} />
          ) : (
            <IconPlayerPlayFilled size={14} />
          )}
          {previews ? "暂停预览" : "播放预览"}
        </button>
      </div>
      <BentoGrid className="study-grid">
        {featuredCases.map((entry, index) => {
          const work = works.find((w) => w.id === entry.id);
          return (
            work && (
              <Study
                key={work.id}
                work={work}
                entry={entry}
                index={index}
                preview={previews && !modalOpen}
                open={open}
              />
            )
          );
        })}
      </BentoGrid>
    </section>
  );
}
function Prompt({ work }: { work: Work }) {
  const p = work.prompt,
    text = p.text?.trim();
  const [copied, setCopied] = useState(false),
    [message, setMessage] = useState(""),
    [translated, setTranslated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setMessage("作者原文已复制");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        setMessage("");
      }, 2400);
    } catch {
      setMessage("复制未完成，请选中正文复制。");
    }
  }
  if (!hasOriginal(work))
    return (
      <section
        id="prompt-content"
        className="source-note"
        aria-labelledby="prompt-heading"
      >
        <div className="section-heading">
          <h3 id="prompt-heading">
            {p.status === "brief" ? "作者制作描述" : "提示词来源"}
          </h3>
          <Link href={p.sourceUrl || work.source}>
            查看原帖
            <IconArrowUpRight size={14} />
          </Link>
        </div>
        {text ? (
          <>
            <blockquote>{text}</blockquote>
            <p className="muted">作者公开的任务描述，非完整提示词。</p>
          </>
        ) : (
          <p className="muted">
            {p.status === "original"
              ? "已收录原文入口，本站暂无提示词正文。"
              : "暂未收录公开提示词；可以继续查看作者原帖。"}
          </p>
        )}
        {p.noteZh && <p className="source-note-detail">{p.noteZh}</p>}
        {p.translationZh && (
          <details className="brief-translation">
            <summary>中文译文</summary>
            <p>{p.translationZh}</p>
          </details>
        )}
      </section>
    );
  return (
    <section
      className="prompt-panel"
      id="prompt-content"
      aria-labelledby="prompt-heading"
    >
      <div className="section-heading prompt-heading">
        <div>
          <p className="eyebrow">作者公开资料</p>
          <h3 id="prompt-heading">提示词原文</h3>
        </div>
        <button
          className="button button-secondary copy-prompt"
          onClick={copy}
          aria-label="复制作者提示词"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? "已复制" : "复制原文"}
        </button>
      </div>
      {p.translationZh && (
        <div className="reader-tabs" aria-label="阅读语言">
          <button
            aria-pressed={!translated}
            onClick={() => setTranslated(false)}
          >
            作者原文
          </button>
          <button aria-pressed={translated} onClick={() => setTranslated(true)}>
            中文译文
          </button>
        </div>
      )}
      <pre
        className="prompt-text"
        lang={translated ? "zh-CN" : p.language || "en"}
      >
        {translated ? p.translationZh : text}
      </pre>
      <div className="prompt-note">
        {translated && (
          <p>译文来自参考库，以作者原文为准；复制按钮始终复制作者原文。</p>
        )}
        {p.noteZh && <p>{p.noteZh}</p>}
      </div>
      <div className="prompt-source">
        <Link href={p.sourceUrl || work.source}>
          作者原文来源
          <IconArrowUpRight size={14} />
        </Link>
        <span role="status" aria-live="polite">
          {message}
        </span>
      </div>
    </section>
  );
}
function Media({ work }: { work: Work }) {
  const video = useRef<HTMLVideoElement>(null),
    requested = useRef(false);
  const [state, setState] = useState<
    "idle" | "loading" | "ready" | "slow" | "failed"
  >("idle");
  useEffect(() => {
    if (state !== "loading" || !requested.current) return;
    const timer = setTimeout(() => setState("slow"), 15000);
    return () => clearTimeout(timer);
  }, [state]);
  return (
    <div className="media-block">
      <div className="detail-media-wrap">
        {work.video ? (
          <video
            ref={video}
            controls
            playsInline
            preload="none"
            className="detail-media"
            poster={work.cover}
            src={work.video}
            onPlay={() => {
              requested.current = true;
              setState(
                video.current && video.current.readyState >= 3
                  ? "ready"
                  : "loading",
              );
            }}
            onWaiting={() => {
              if (requested.current) setState("loading");
            }}
            onCanPlay={() => setState("ready")}
            onPlaying={() => setState("ready")}
            onPause={() => {
              if (state === "loading" || state === "slow") setState("idle");
            }}
            onError={() => setState("failed")}
          />
        ) : (
          <Cover work={work} eager />
        )}
      </div>
      {(state === "failed" || state === "slow" || !work.video) && (
        <div className="media-status" role="status">
          <span>
            {state === "failed"
              ? "视频暂时无法加载。"
              : state === "slow"
                ? "加载较慢，可以前往作者原帖观看。"
                : "暂无页内视频，可查看作者原帖。"}
          </span>
          <Link href={work.source}>
            作者原帖
            <IconArrowUpRight size={14} />
          </Link>
          {state === "failed" && (
            <button
              onClick={() => {
                requested.current = false;
                setState("idle");
                video.current?.load();
              }}
            >
              重新加载
            </button>
          )}
        </div>
      )}
      <div className="media-caption">
        <span>
          {work.category} · {duration(work.duration)}
        </span>
        <Link href={work.source}>
          作者原帖
          <IconArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
function Materials({ work }: { work: Work }) {
  const demo =
      work.demoUrl || work.resources.find((r) => r.kind === "demo")?.url,
    code = work.resources.find((r) => r.kind === "code"),
    resources = work.resources.filter(
      (r) => (r.url !== demo && r !== code) || Boolean(r.note || r.license),
    );
  return (
    <section
      className="materials"
      id="resources-content"
      aria-labelledby="materials-heading"
    >
      <div className="section-heading">
        <h3 id="materials-heading">从哪里开始做</h3>
      </div>
      <div className="material-actions">
        {demo && (
          <Link href={demo} className="button button-primary">
            <IconWorld size={17} />
            {work.demoUrl ? "体验交互" : "打开作品页面"}
            <IconArrowUpRight size={15} />
          </Link>
        )}
        {hasOriginal(work) && (
          <a
            href="#prompt-content"
            className={`button ${demo ? "button-secondary" : "button-primary"}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("prompt-content")
                ?.scrollIntoView({ block: "start", behavior: "smooth" });
            }}
          >
            <IconBook2 size={17} />
            读作者指令
            <IconArrowRight size={15} />
          </a>
        )}
        {code && (
          <Link
            href={code.url}
            className={`button ${demo || hasOriginal(work) ? "button-secondary" : "button-primary"}`}
          >
            <IconCode size={17} />
            查看源码
            <IconArrowUpRight size={15} />
          </Link>
        )}
        {!demo && !hasOriginal(work) && !code && (
          <Link href={work.source} className="button button-primary">
            查看作者原帖
            <IconArrowUpRight size={15} />
          </Link>
        )}
      </div>
      {resources.length > 0 && (
        <div className="resource-list">
          {resources.map((r, i) => (
            <div className="resource-item" key={`${r.url}-${i}`}>
              {r !== code && (
                <div className="resource-title">
                  <span>
                    {r.kind === "code"
                      ? "源码"
                      : r.kind === "demo"
                        ? "演示"
                        : "相关资料"}
                  </span>
                  {r.url === demo ? (
                    <span>{r.label || "作品页面"}</span>
                  ) : (
                    <Link href={r.url}>
                      {r.label || "作者资料"}
                      <IconArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              )}
              {r.license && (
                <p className="resource-license">
                  许可：
                  {r.licenseUrl ? (
                    <Link href={r.licenseUrl}>
                      {r.license === "not_specified" ? "未标明" : r.license}
                      <IconArrowUpRight size={12} />
                    </Link>
                  ) : r.license === "not_specified" ? (
                    "未标明，复用前请核对"
                  ) : (
                    r.license
                  )}
                </p>
              )}
              {r.note && <p>{r.note}</p>}
            </div>
          ))}
        </div>
      )}
      {work.guide && (
        <div className="guide">
          <div className="guide-label">
            <span>制作思路</span>
            <span>上游整理</span>
          </div>
          <p>{work.guide.takeawayZh}</p>
          <ol>
            {work.guide.stepsZh.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Link
            href={`${UPSTREAM}/blob/2ff3da3f72385c7944f53faac253f2a6f5bbf936/cases/${work.id}.md`}
          >
            {work.guide.attribution}
            <IconArrowUpRight size={12} />
          </Link>
        </div>
      )}
      {!work.resources.length && !work.guide && !demo && !hasOriginal(work) && (
        <p className="material-empty">
          目前主要用于效果参考；尚未收录独立的制作资料。
        </p>
      )}
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
  const entry = featuredCases.find((c) => c.id === work.id);
  useEffect(() => {
    const dialog = document.querySelector<HTMLDialogElement>("dialog");
    const frame = requestAnimationFrame(() => {
      if (initialSection)
        document
          .getElementById(initialSection)
          ?.scrollIntoView({ block: "start" });
      else dialog?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialSection]);
  return (
    <div className="detail-content">
      <header className="detail-intro">
        <p className="eyebrow">{entry?.kicker || work.category}</p>
        <h2 id="detail-title">{work.title}</h2>
        <div className="detail-byline">
          <Link href={work.author.url}>@{work.author.handle}</Link>
          <span>{formatDate(work.date)}</span>
          <span>{work.model || "模型未标明"}</span>
        </div>
      </header>
      <div className="detail-overview">
        <div className="detail-visual">
          <Media work={work} />
          <p className="work-summary">{work.summary}</p>
        </div>
        <aside className="detail-sidebar">
          <Materials work={work} />
          {entry && work.guide ? (
            <p className="editor-note-short">
              <span>选读理由</span>
              {entry.reason}
            </p>
          ) : entry ? (
            <section className="editor-note">
              <p className="eyebrow">为什么选这件</p>
              <h3>{entry.title}</h3>
              <p>{entry.reason}</p>
              <ul>
                {entry.learn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
      <Prompt work={work} />
      <p className="detail-attribution">
        作品与原文归作者所有。编目与上游指南来自{" "}
        <Link href={UPSTREAM}>Awesome AI Motion</Link>
        ；本项目补充选读理由。公开指令未必包含完整素材与对话。
      </p>
    </div>
  );
}
function WorkActions({
  work,
  open,
}: {
  work: Work;
  open: (work: Work, section?: string) => void;
}) {
  const original = hasOriginal(work),
    code = hasCode(work),
    demo = hasDemo(work);
  return (
    <div className="work-actions">
      {original && (
        <button onClick={() => open(work, "prompt-content")}>
          <IconBook2 size={13} />
          作者指令
        </button>
      )}
      {code && (
        <button onClick={() => open(work, "resources-content")}>
          <IconCode size={13} />
          源码
        </button>
      )}
      {demo && (
        <button onClick={() => open(work, "resources-content")}>
          <IconWorld size={13} />
          演示
        </button>
      )}
      {!original &&
        !code &&
        !demo &&
        (work.guide || work.resources.length ? (
          <button onClick={() => open(work, "resources-content")}>
            制作资料
            <IconArrowUpRight size={13} />
          </button>
        ) : (
          <span>
            {work.prompt.status === "brief" && work.prompt.text?.trim()
              ? "作者任务描述"
              : work.prompt.status === "original"
                ? "提示词来源"
                : "仅原帖参考"}
          </span>
        ))}
    </div>
  );
}
function App() {
  const [works, setWorks] = useState<Work[]>([]),
    [error, setError] = useState(false);
  const [query, setQuery] = useState(() => params().get("q") || ""),
    [category, setCategory] = useState(
      () => params().get("category") || "全部",
    );
  const [mode, setMode] = useState<Mode>(() =>
    ["prompt", "code"].includes(params().get("type") || "")
      ? (params().get("type") as Mode)
      : "all",
  );
  const [sort, setSort] = useState(() => params().get("sort") || "editorial"),
    [limit, setLimit] = useState(24),
    [active, setActive] = useState<Work | null>(null),
    [detailSection, setDetailSection] = useState("");
  const search = useRef<HTMLInputElement>(null),
    results = useRef<HTMLHeadingElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("works.json", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data: Work[]) => {
        setWorks(data);
        const work = data.find((w) => w.id === params().get("work"));
        if (work) setActive(work);
        else if (
          params().has("q") ||
          params().has("type") ||
          params().has("category")
        ) {
          requestAnimationFrame(() =>
            document
              .getElementById("library")
              ?.scrollIntoView({ block: "start" }),
          );
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
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
        search.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      controller.abort();
      document.removeEventListener("keydown", key);
    };
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
  useEffect(() => {
    const restore = () => {
      const current = params();
      setQuery(current.get("q") || "");
      setCategory(current.get("category") || "全部");
      setMode(
        ["prompt", "code"].includes(current.get("type") || "")
          ? (current.get("type") as Mode)
          : "all",
      );
      setSort(current.get("sort") || "editorial");
      setDetailSection("");
      const work = works.find((w) => w.id === current.get("work")) || null;
      setActive((prior) => {
        if (prior && !work)
          requestAnimationFrame(() =>
            (returnFocus.current || results.current)?.focus({
              preventScroll: true,
            }),
          );
        return work;
      });
    };
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, [works]);
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
    updateUrl({ work: work.id }, !active);
  }
  function close() {
    if (history.state?.motionWork) {
      history.back();
      return;
    }
    setActive(null);
    setDetailSection("");
    updateUrl({ work: null });
    requestAnimationFrame(() =>
      (returnFocus.current || results.current)?.focus(),
    );
  }
  function reset() {
    setQuery("");
    setCategory("全部");
    setMode("all");
  }
  function showResults() {
    results.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    results.current?.focus({ preventScroll: true });
  }
  function focusSearch() {
    search.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    search.current?.focus({ preventScroll: true });
  }
  const position = active ? selected.findIndex((w) => w.id === active.id) : -1;
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#library">
        跳到作品库
      </a>
      <Header search={focusSearch} />
      <main className="page-main">
        <Intro
          works={works}
          query={query}
          setQuery={setQuery}
          open={open}
          showResults={showResults}
          modalOpen={!!active}
        />
        <section
          className="collection"
          id="library"
          aria-labelledby="library-heading"
        >
          <div className="library-title">
            <div>
              <p className="eyebrow">继续探索</p>
              <h2 ref={results} tabIndex={-1} id="library-heading">
                作品库<span>{works.length || 441}</span>
              </h2>
            </div>
            <p>
              作者原文 <strong>{modeCounts.prompt || 52}</strong>
              <span> / </span>附源码 <strong>{modeCounts.code || 25}</strong>
            </p>
          </div>
          <div className="library-controls">
            <div className="toolbar">
              <div className="resource-modes" aria-label="按制作资料浏览">
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
              <label className="sort-control">
                <span className="sr-only">作品排序</span>
                <select
                  aria-label="作品排序"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="editorial">推荐顺序</option>
                  <option value="popular">原帖收藏</option>
                  <option value="latest">最新发布</option>
                </select>
              </label>
            </div>
            <SearchField
              value={query}
              onChange={setQuery}
              inputRef={search}
              onSubmit={showResults}
            />
            <CategoryTabs
              tabs={categoryCounts}
              active={category}
              onChange={setCategory}
            />
          </div>
          <div className="results-bar">
            <p role="status" aria-live="polite">
              {works.length
                ? `${selected.length} 件作品`
                : error
                  ? "读取失败"
                  : "正在读取作品…"}
            </p>
            <span>
              {mode === "prompt"
                ? "作者公开正文，任务描述单独标记"
                : mode === "code"
                  ? "资料与许可请以作者项目为准"
                  : "封面可预览，点击查看作品与资料"}
            </span>
            {(query || category !== "全部" || mode !== "all") && (
              <button onClick={reset}>
                清除筛选
                <IconX size={13} />
              </button>
            )}
          </div>
          {error && (
            <div className="empty-state">
              <h3>作品暂时未能载入</h3>
              <p>请重新载入，或前往 GitHub 查看项目。</p>
              <button
                className="button button-primary"
                onClick={() => location.reload()}
              >
                重新载入
              </button>
            </div>
          )}
          <GalleryHoverEffect
            items={selected.slice(0, limit)}
            renderItem={(work: Work) => (
              <>
                <PreviewCover
                  work={work}
                  className="work-cover"
                  label={`查看 ${work.title}`}
                  onClick={() => open(work)}
                />
                <div className="work-content">
                  <div className="work-category">{work.category}</div>
                  <h3>
                    <button onClick={() => open(work)}>{work.title}</button>
                  </h3>
                  <div className="work-byline">
                    <Link href={work.author.url}>@{work.author.handle}</Link>
                    <span>{duration(work.duration)}</span>
                  </div>
                  <WorkActions work={work} open={open} />
                </div>
              </>
            )}
          />
          {works.length > 0 && !selected.length && (
            <div className="empty-state">
              <h3>没有找到匹配的作品</h3>
              <p>试试别的关键词，或清除筛选继续浏览。</p>
              <button className="button button-primary" onClick={reset}>
                查看全部作品
              </button>
            </div>
          )}
          {selected.length > limit && (
            <div className="load-more">
              <button
                className="button button-secondary"
                onClick={() => setLimit((n) => n + 24)}
              >
                再看 24 件<IconArrowRight size={16} />
              </button>
              <span>
                已显示 {Math.min(limit, selected.length)} / {selected.length}
              </span>
            </div>
          )}
        </section>
      </main>
      <footer className="site-footer" id="sources">
        <div className="footer-top">
          <div>
            <Brand />
            <p>作品值得看，资料有出处。</p>
          </div>
          <nav aria-label="来源与项目">
            <Link href={PROJECT + "/blob/main/SOURCE.md"}>收录来源</Link>
            <Link href={PROJECT + "/blob/main/THIRD_PARTY.md"}>资料与许可</Link>
            <Link href={PROJECT + "/issues"}>
              补充与纠错
              <IconArrowUpRight size={14} />
            </Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>
            编目来自 <Link href={UPSTREAM}>观默 · Awesome AI Motion</Link>
            。作品归原作者所有。
          </p>
          <span>内容快照 · 2026.10.03</span>
        </div>
      </footer>
      <AnimatedDialog open={!!active} onClose={close}>
        {active && (
          <>
            <Detail
              key={active.id}
              work={active}
              initialSection={detailSection}
            />
            <nav className="detail-pagination" aria-label="相邻作品">
              <button
                disabled={position <= 0}
                onClick={() => open(selected[position - 1])}
              >
                <IconArrowLeft size={16} />
                上一件
              </button>
              <span>
                {position >= 0
                  ? `${position + 1} / ${selected.length}`
                  : "编辑选读"}
              </span>
              <button
                disabled={position < 0 || position >= selected.length - 1}
                onClick={() => open(selected[position + 1])}
              >
                下一件
                <IconArrowRight size={16} />
              </button>
            </nav>
          </>
        )}
      </AnimatedDialog>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
