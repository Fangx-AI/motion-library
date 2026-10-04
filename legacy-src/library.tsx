import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavMenu, NavbarButton } from "./components/ui/resizable-navbar";
import { Input } from "./components/aceternity/input";
import { Label } from "./components/aceternity/label";
import { Tabs } from "./components/aceternity/tabs";
import { Modal, ModalBody, ModalContent, ModalFooter } from "./components/aceternity/animated-modal";
import { CodeBlock } from "./components/aceternity/code-block";
import { Button } from "./components/aceternity/stateful-button";
import { selectWorks, hasOriginal, hasCode, hasDemo, formatDate, duration, type Work, type Mode } from "./library-model";
import { featuredCases } from "./editorial";

// All visual templates are from the official public sources listed in DESIGN-SOURCES.md.
// Adapters below supply the catalog, URLs, media handling and accessible controls.
const PROJECT = "https://github.com/Fangx-AI/motion-library";
const UPSTREAM = "https://github.com/guanmo-ai/awesome-ai-motion";
const heading = "text-xl font-bold text-neutral-800 dark:text-neutral-200"; // SignupFormDemo
const bodyText = "text-sm text-neutral-600 dark:text-neutral-300"; // SignupFormDemo
const primary = "w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"; // HeroSectionOne
const secondary = "w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900"; // HeroSectionOne
const modeLabels: Record<Mode, string> = { all: "全部作品", prompt: "作者提示词", code: "附源码" };
const params = () => new URLSearchParams(location.search);
function updateUrl(patch: Record<string, string | null>, push = false) {
  const url = new URL(location.href);
  for (const [key, value] of Object.entries(patch)) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  if (push) history.pushState({ motionWork: true }, "", url);
  else history.replaceState(history.state, "", url);
}
function Link({ href, children, className, ...props }: { href: string; children: React.ReactNode; className?: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return <a href={/^https:\/\//.test(href || "") ? href : undefined} className={className} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}
function Brand() {
  // NavbarLogo's wrapper, HeroSectionOne's brand mark; only the project name changes.
  return <a href="./" className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black" aria-label="Motion Library 首页">
    <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" aria-hidden="true" />
    <span className="font-medium text-black dark:text-white">Motion Library</span>
  </a>;
}
function Header({ search }: { search: () => void }) {
  const [menu, setMenu] = useState(false);
  const items = [{ name: "精选作品", link: "#selected" }, { name: "作品库", link: "#library" }, { name: "资料来源", link: "#sources" }];
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);
  return <Navbar>
    <NavBody>
      <Brand />
      <NavItems items={items} />
      <div className="flex items-center gap-4">
        <NavbarButton as="button" variant="secondary" onClick={search}>搜索 /</NavbarButton>
        <NavbarButton href={PROJECT} target="_blank" rel="noopener noreferrer" variant="primary">GitHub</NavbarButton>
      </div>
    </NavBody>
    <MobileNav>
      <MobileNavHeader>
        <Brand />
        <button type="button" aria-label={menu ? "关闭导航" : "打开导航"} aria-expanded={menu} aria-controls="mobile-links" onClick={() => setMenu(!menu)}>
          {menu ? <IconX className="text-black dark:text-white" /> : <IconMenu2 className="text-black dark:text-white" />}
        </button>
      </MobileNavHeader>
      <MobileNavMenu isOpen={menu} onClose={() => setMenu(false)}>
        <nav id="mobile-links" className="flex w-full flex-col gap-4" aria-label="手机导航">
          {items.map((item) => <a key={item.link} href={item.link} onClick={() => setMenu(false)} className="relative text-neutral-600 dark:text-neutral-300"><span className="block">{item.name}</span></a>)}
          <NavbarButton as="button" onClick={() => { setMenu(false); search(); }} variant="primary" className="w-full">搜索作品</NavbarButton>
          <NavbarButton href={PROJECT} target="_blank" rel="noopener noreferrer" variant="primary" className="w-full">GitHub</NavbarButton>
        </nav>
      </MobileNavMenu>
    </MobileNav>
  </Navbar>;
}
function Cover({ work, className, eager = false }: { work: Work; className: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className={`${bodyText} ${className}`} role="img" aria-label={`${work.title} 封面暂不可用`}>封面暂不可用，仍可查看作者资料。</span>
    : <img src={work.cover} alt={work.title} className={className} width={1000} height={1000} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
}
function Media({ work, hero = false, suspended = false }: { work: Work; hero?: boolean; suspended?: boolean }) {
  const video = useRef<HTMLVideoElement>(null), requested = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "slow" | "failed">("idle");
  useEffect(() => { if (suspended) video.current?.pause(); }, [suspended]);
  useEffect(() => {
    if (state !== "loading" || !requested.current) return;
    const timer = setTimeout(() => setState("slow"), 15000);
    return () => clearTimeout(timer);
  }, [state]);
  const mediaClass = hero ? "aspect-[16/9] h-auto w-full object-contain" : "w-full rounded-lg object-contain";
  return <div>
    {work.video ? <video ref={video} controls playsInline preload="none" className={mediaClass} poster={work.cover} src={work.video} aria-label={`${work.title} 视频`}
      onPlay={() => { requested.current = true; setState(video.current && video.current.readyState >= 3 ? "ready" : "loading"); }}
      onWaiting={() => { if (requested.current) setState("loading"); }}
      onCanPlay={() => setState("ready")} onPlaying={() => setState("ready")}
      onPause={() => { if (state === "loading" || state === "slow") setState("idle"); }}
      onError={() => setState("failed")} /> : <Cover work={work} className={mediaClass} eager />}
    {(state === "failed" || state === "slow" || !work.video) && <div className="flex flex-wrap items-center gap-4 p-4" role="status">
      <p className={bodyText}>{state === "failed" ? "视频暂时无法加载。" : state === "slow" ? "加载较慢，可以前往作者原帖观看。" : "暂无页内视频，可查看作者原帖。"}</p>
      <NavbarButton href={work.source} target="_blank" rel="noopener noreferrer" variant="secondary">作者原帖 ↗</NavbarButton>
      {state === "failed" && <NavbarButton as="button" variant="secondary" onClick={() => { requested.current = false; setState("idle"); video.current?.load(); }}>重新加载</NavbarButton>}
    </div>}
  </div>;
}
function Hero({ works, open, modalOpen }: { works: Work[]; open: (work: Work, section?: string) => void; modalOpen: boolean }) {
  const work = works.find((w) => w.id === featuredCases[0].id);
  // HeroSectionOne, with its inline Navbar replaced by the complete ResizableNavbar above.
  return <section aria-labelledby="intro-title" className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
    <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" aria-hidden="true"><div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" /></div>
    <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" aria-hidden="true"><div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" /></div>
    <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80" aria-hidden="true"><div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" /></div>
    <div className="w-full px-4 py-10 md:py-20">
      <h1 id="intro-title" className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
        {["看动效，", "也看制作。"].map((word, i) => <motion.span key={word} initial={{ opacity: 0, filter: "blur(4px)", y: 10 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.3, delay: i * 0.1, ease: "easeInOut" }} className="mr-2 inline-block">{word}</motion.span>)}
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.8 }} className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400">
        {works.length || 441} 件作品，{works.filter(hasOriginal).length || 52} 条作者原文，{works.filter(hasCode).length || 25} 件附源码。
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 1 }} className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
        <a href="#library" className={`${primary} text-center`}>浏览作品 →</a>
        <button className={secondary} disabled={!work} onClick={() => work && open(work, "resources-content")}>Clearwater · 制作资料 ↗</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 1.2 }} className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900">
        <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
          {work ? <Media work={work} hero suspended={modalOpen} /> : <div className="aspect-[16/9]" aria-label="正在读取精选作品" />}
        </div>
      </motion.div>
      {work && <p className={`mt-2 text-center ${bodyText}`}>Clearwater · 交互水面 / <Link href={work.author.url}>@{work.author.handle} ↗</Link></p>}
    </div>
  </section>;
}
function WorkGrid({ works, open, eager = false }: { works: Work[]; open: (work: Work, section?: string) => void; eager?: boolean }) {
  // Expandable Card's official Grid demo. Click handling is controlled by the URL-aware Modal.
  return <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
    {works.map((work) => <li key={work.id}>
      <motion.button type="button" onClick={() => open(work)} aria-label={`查看 ${work.title}`} className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer w-full">
        <div className="flex gap-4 flex-col w-full">
          <motion.div><Cover work={work} eager={eager} className="h-60 w-full rounded-lg object-cover object-top" /></motion.div>
          <div className="flex justify-center items-center flex-col">
            <motion.h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base">{work.title}</motion.h3>
            <motion.p className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base">@{work.author.handle} · {duration(work.duration)}</motion.p>
            <motion.p className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base">{[hasOriginal(work) && "作者原文", hasCode(work) && "源码", hasDemo(work) && "演示"].filter(Boolean).join(" · ") || (work.prompt.status === "brief" ? "作者任务描述" : "原帖参考")}</motion.p>
          </div>
        </div>
      </motion.button>
    </li>)}
  </ul>;
}
function Prompt({ work }: { work: Work }) {
  const p = work.prompt, text = p.text?.trim();
  return <section id="prompt-content" className="my-8" aria-labelledby="prompt-heading">
    <h3 id="prompt-heading" className={heading}>{hasOriginal(work) ? "提示词原文" : p.status === "brief" ? "作者制作描述" : "提示词来源"}</h3>
    <div className="my-4">
      {hasOriginal(work) ? <CodeBlock language="text" filename="作者公开指令" showLineNumbers={false} copyText={p.text || ""} copyLabel="复制作者原文"
        {...(p.translationZh ? { tabs: [{ name: "作者原文", code: p.text || "", language: "text" }, { name: "中文译文", code: p.translationZh, language: "text" }] } : { code: p.text || "" })} />
        : text ? <><blockquote className={`${bodyText} whitespace-pre-wrap break-words`}>{text}</blockquote><p className={`mt-2 ${bodyText}`}>作者公开的任务描述，非完整提示词。</p></>
          : <p className={bodyText}>暂未收录提示词正文，可查看作者原帖。</p>}
    </div>
    {p.translationZh && (hasOriginal(work) ? <p className={bodyText}>译文来自参考库，以作者原文为准。复制按钮始终复制作者原文。</p> : <details className={`my-4 ${bodyText}`}><summary>中文译文</summary><p className="mt-2 whitespace-pre-wrap">{p.translationZh}</p></details>)}
    {p.noteZh && <p className={`mt-2 ${bodyText}`}>{p.noteZh}</p>}
    <NavbarButton href={p.sourceUrl || work.source} target="_blank" rel="noopener noreferrer" variant="secondary">作者原文来源 ↗</NavbarButton>
  </section>;
}
function Materials({ work }: { work: Work }) {
  const demo = work.demoUrl || work.resources.find((r) => r.kind === "demo")?.url,
    code = work.resources.find((r) => r.kind === "code"),
    resources = work.resources.filter((r) => (r.url !== demo && r !== code) || Boolean(r.note || r.license));
  return <section id="resources-content" className="my-8" aria-labelledby="materials-heading">
    <h3 id="materials-heading" className={heading}>制作资料</h3>
    <div className="my-4 flex flex-wrap items-center gap-4">
      {demo && <NavbarButton href={demo} target="_blank" rel="noopener noreferrer" variant="primary">{work.demoUrl ? "体验交互" : "打开作品页面"} ↗</NavbarButton>}
      {hasOriginal(work) && <NavbarButton href="#prompt-content" variant="primary" onClick={(e: React.MouseEvent) => { e.preventDefault(); document.getElementById("prompt-content")?.scrollIntoView({ block: "start", behavior: "smooth" }); }}>读作者指令 ↓</NavbarButton>}
      {code && <NavbarButton href={code.url} target="_blank" rel="noopener noreferrer" variant="primary">查看源码 ↗</NavbarButton>}
      {!demo && !hasOriginal(work) && !code && <NavbarButton href={work.source} target="_blank" rel="noopener noreferrer" variant="primary">作者原帖 ↗</NavbarButton>}
    </div>
    {resources.map((r, i) => <div className="my-4" key={`${r.url}-${i}`}>
      {r !== code && <p className={bodyText}>{r.url === demo ? r.label || "作品页面" : <Link href={r.url}>{r.label || "作者资料"} ↗</Link>}</p>}
      {r.license && <p className={`mt-2 ${bodyText}`}>许可：{r.licenseUrl ? <Link href={r.licenseUrl}>{r.license === "not_specified" ? "未标明" : r.license} ↗</Link> : r.license === "not_specified" ? "未标明，复用前请核对" : r.license}</p>}
      {r.note && <p className={`mt-2 ${bodyText}`}>{r.note}</p>}
    </div>)}
    {work.guide && <div className="my-8">
      <h4 className={heading}>制作思路</h4>
      <p className={`mt-2 ${bodyText}`}>{work.guide.takeawayZh}</p>
      <ol className={`my-4 list-decimal space-y-2 pl-4 ${bodyText}`}>{work.guide.stepsZh.map((step, i) => <li key={i}>{step}</li>)}</ol>
      <Link className={bodyText} href={`${UPSTREAM}/blob/2ff3da3f72385c7944f53faac253f2a6f5bbf936/cases/${work.id}.md`}>{work.guide.attribution} ↗</Link>
    </div>}
    {!work.resources.length && !work.guide && !demo && !hasOriginal(work) && <p className={bodyText}>目前用于效果参考，尚未收录独立制作资料。</p>}
  </section>;
}
function Detail({ work, initialSection }: { work: Work; initialSection: string }) {
  const entry = featuredCases.find((c) => c.id === work.id);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (initialSection) document.getElementById(initialSection)?.scrollIntoView({ block: "start" });
      else document.getElementById("detail-scroll")?.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [work.id, initialSection]);
  return <>
    <h2 id="detail-title" className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">{work.title}</h2>
    <p className={`mb-4 text-center ${bodyText}`}><Link href={work.author.url}>@{work.author.handle} ↗</Link> · {formatDate(work.date)} · {work.model || "模型未标明"}</p>
    <Media work={work} />
    <p className={`mt-2 ${bodyText}`}>{work.summary}</p>
    <Materials work={work} />
    {entry && <div className="my-8"><h3 className={heading}>选读理由</h3><p className={`mt-2 ${bodyText}`}>{entry.reason}</p></div>}
    <Prompt work={work} />
    <p className={bodyText}>作品与原文归作者所有。编目与制作指南来自 <Link href={UPSTREAM}>Awesome AI Motion ↗</Link>。</p>
  </>;
}
function Footer() {
  return <footer id="sources" className="mx-auto my-10 max-w-7xl">
    {/* HeroSectionOne border row with ResizableNavbar's NavbarButton controls. */}
    <div className="flex w-full flex-wrap items-center justify-between gap-4 border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <Brand />
      <nav className="flex flex-wrap items-center gap-4" aria-label="来源与项目">
        <NavbarButton href={PROJECT + "/blob/main/SOURCE.md"} target="_blank" rel="noopener noreferrer" variant="secondary">内容来源</NavbarButton>
        <NavbarButton href={PROJECT + "/blob/main/DESIGN-SOURCES.md"} target="_blank" rel="noopener noreferrer" variant="secondary">组件来源</NavbarButton>
        <NavbarButton href={PROJECT + "/issues"} target="_blank" rel="noopener noreferrer" variant="primary">补充与纠错 ↗</NavbarButton>
      </nav>
    </div>
    <p className={`px-4 py-4 ${bodyText}`}>编目来自 <Link href={UPSTREAM}>观默 · Awesome AI Motion ↗</Link>。作品归原作者所有 · 内容快照 2026.10.03 · <Link href={PROJECT + "/blob/main/THIRD_PARTY.md"}>资料与许可 ↗</Link></p>
  </footer>;
}
function App() {
  const [works, setWorks] = useState<Work[]>([]), [error, setError] = useState(false);
  const [query, setQuery] = useState(() => params().get("q") || ""), [category, setCategory] = useState(() => params().get("category") || "全部");
  const [mode, setMode] = useState<Mode>(() => ["prompt", "code"].includes(params().get("type") || "") ? params().get("type") as Mode : "all");
  const [sort, setSort] = useState(() => params().get("sort") || "editorial"), [limit, setLimit] = useState(24), [active, setActive] = useState<Work | null>(null), [detailSection, setDetailSection] = useState("");
  const search = useRef<HTMLInputElement>(null), results = useRef<HTMLHeadingElement>(null), returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("works.json", { signal: controller.signal }).then((r) => { if (!r.ok) throw Error(); return r.json(); }).then((data: Work[]) => {
      setWorks(data);
      const work = data.find((w) => w.id === params().get("work"));
      if (work) setActive(work);
      else if (params().has("q") || params().has("type") || params().has("category")) requestAnimationFrame(() => document.getElementById("library")?.scrollIntoView({ block: "start" }));
    }).catch((e) => { if (e.name !== "AbortError") setError(true); });
    const key = (e: KeyboardEvent) => {
      if (e.key === "/" && !document.querySelector('[role="dialog"][aria-modal="true"]') && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault(); search.current?.focus(); search.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    document.addEventListener("keydown", key);
    return () => { controller.abort(); document.removeEventListener("keydown", key); };
  }, []);
  useEffect(() => {
    setLimit(24); updateUrl({ q: query || null, category: category === "全部" ? null : category, type: mode === "all" ? null : mode, sort: sort === "editorial" ? null : sort });
  }, [query, category, mode, sort]);
  useEffect(() => {
    const restore = () => {
      const current = params();
      setQuery(current.get("q") || ""); setCategory(current.get("category") || "全部"); setMode(["prompt", "code"].includes(current.get("type") || "") ? current.get("type") as Mode : "all"); setSort(current.get("sort") || "editorial"); setDetailSection("");
      const work = works.find((w) => w.id === current.get("work")) || null;
      setActive((prior) => { if (prior && !work) requestAnimationFrame(() => (returnFocus.current || results.current)?.focus({ preventScroll: true })); return work; });
    };
    addEventListener("popstate", restore); return () => removeEventListener("popstate", restore);
  }, [works]);
  const selected = useMemo(() => selectWorks(works, { mode, category, query, sort }), [works, mode, category, query, sort]);
  const categoryCounts = useMemo(() => {
    const rows = selectWorks(works, { mode, query });
    return ["全部", ...new Set(works.map((w) => w.category))].map((name) => ({ name, count: name === "全部" ? rows.length : rows.filter((w) => w.category === name).length }));
  }, [works, mode, query]);
  const modeCounts = { all: works.length, prompt: works.filter(hasOriginal).length, code: works.filter(hasCode).length };
  function open(work: Work, section = "") { if (!active) returnFocus.current = document.activeElement as HTMLElement; setDetailSection(section); setActive(work); updateUrl({ work: work.id }, !active); }
  function close() {
    if (history.state?.motionWork) { history.back(); return; }
    setActive(null); setDetailSection(""); updateUrl({ work: null }); requestAnimationFrame(() => (returnFocus.current || results.current)?.focus());
  }
  function reset() { setQuery(""); setCategory("全部"); setMode("all"); }
  function showResults() { results.current?.scrollIntoView({ block: "start", behavior: "smooth" }); results.current?.focus({ preventScroll: true }); }
  function focusSearch() { search.current?.scrollIntoView({ block: "center", behavior: "smooth" }); search.current?.focus({ preventScroll: true }); }
  const position = active ? selected.findIndex((w) => w.id === active.id) : -1;
  const featured = featuredCases.flatMap((entry) => { const work = works.find((w) => w.id === entry.id); return work ? [work] : []; });
  return <MotionConfig reducedMotion="user">
    <a className="sr-only focus:not-sr-only" href="#library">跳到作品库</a>
    <Header search={focusSearch} />
    <main>
      <Hero works={works} open={open} modalOpen={!!active} />
      <section id="selected" aria-labelledby="selected-heading" className="mx-auto my-40 w-full max-w-2xl px-4">
        <h2 id="selected-heading" className={`${heading} mb-8 text-center`}>从这三件开始</h2>
        <WorkGrid works={featured} open={open} eager />
      </section>
      <section id="library" aria-labelledby="library-heading" className="relative mx-auto my-40 flex w-full max-w-2xl flex-col items-start justify-start px-4">
        <h2 id="library-heading" ref={results} tabIndex={-1} className={`${heading} mb-8`}>作品库</h2>
        <div className="w-full space-y-4">
          <Tabs navigationOnly ariaLabel="按制作资料浏览" value={mode} onValueChange={(v) => { setMode(v as Mode); setCategory("全部"); }} tabs={(["all", "prompt", "code"] as Mode[]).map((value) => ({ title: `${modeLabels[value]} ${modeCounts[value] || "—"}`, value }))} containerClassName="overflow-x-auto sm:overflow-x-auto" tabClassName="shrink-0 whitespace-nowrap" />
          <form role="search" className="flex w-full flex-col space-y-2" onSubmit={(e) => { e.preventDefault(); showResults(); }}>
            <Label htmlFor="work-search">搜索作品、作者或提示词</Label>
            <Input id="work-search" ref={search} type="search" placeholder="试试 WebGL、水面、像素" value={query} onChange={(e) => setQuery(e.target.value)} />
          </form>
          <Tabs navigationOnly ariaLabel="作品分类" value={category} onValueChange={setCategory} tabs={categoryCounts.map(({ name, count }) => ({ title: `${name} ${count}`, value: name }))} containerClassName="overflow-x-auto sm:overflow-x-auto" tabClassName="shrink-0 whitespace-nowrap" />
          <Tabs navigationOnly ariaLabel="作品排序" value={sort} onValueChange={setSort} tabs={[{ title: "推荐顺序", value: "editorial" }, { title: "原帖收藏", value: "popular" }, { title: "最新发布", value: "latest" }]} containerClassName="overflow-x-auto sm:overflow-x-auto" tabClassName="shrink-0 whitespace-nowrap" />
        </div>
        <div className="my-8 flex w-full flex-wrap items-center justify-between gap-4">
          <p className={bodyText} role="status" aria-live="polite">{works.length ? `${selected.length} 件作品` : error ? "读取失败" : "正在读取作品…"}</p>
          {(query || category !== "全部" || mode !== "all") && <NavbarButton as="button" variant="secondary" onClick={reset}>清除筛选 ×</NavbarButton>}
        </div>
        {error && <div className="my-8"><h3 className={heading}>作品暂时未能载入</h3><NavbarButton as="button" variant="primary" onClick={() => location.reload()}>重新载入</NavbarButton></div>}
        <WorkGrid works={selected.slice(0, limit)} open={open} />
        {works.length > 0 && !selected.length && <div className="my-8"><h3 className={heading}>没有找到匹配的作品</h3><p className={`my-4 ${bodyText}`}>试试别的关键词，或清除筛选继续浏览。</p><NavbarButton as="button" variant="primary" onClick={reset}>查看全部作品</NavbarButton></div>}
        {selected.length > 24 && <div className="my-8 flex w-full flex-col items-center gap-4"><Button disabled={limit >= selected.length} onClick={() => setLimit((n) => n + 24)}>{limit >= selected.length ? "已显示全部" : "再看 24 件 →"}</Button><p className={bodyText}>已显示 {Math.min(limit, selected.length)} / {selected.length}</p></div>}
      </section>
    </main>
    <Footer />
    <Modal open={!!active} onOpenChange={(value) => { if (!value) close(); }}>
      <ModalBody aria-labelledby="detail-title">
        <ModalContent id="detail-scroll" className="min-h-0 overflow-y-auto" >
          {active && <Detail key={active.id} work={active} initialSection={detailSection} />}
        </ModalContent>
        <ModalFooter className="gap-4 shrink-0">
          <nav className="flex w-full items-center justify-between" aria-label="相邻作品">
            <NavbarButton as="button" variant="secondary" disabled={position <= 0} onClick={() => open(selected[position - 1])}>← 上一件</NavbarButton>
            <span className={bodyText}>{position >= 0 ? `${position + 1} / ${selected.length}` : "精选作品"}</span>
            <NavbarButton as="button" variant="secondary" disabled={position < 0 || position >= selected.length - 1} onClick={() => open(selected[position + 1])}>下一件 →</NavbarButton>
          </nav>
        </ModalFooter>
      </ModalBody>
    </Modal>
  </MotionConfig>;
}
createRoot(document.getElementById("root")!).render(<App />);
