"use client";
import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import atomDark from "react-syntax-highlighter/dist/esm/styles/prism/atom-dark";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export type CodeBlockProps = {
  language: string;
  filename: string;
  highlightLines?: number[];
  copyText?: string;
  copyLabel?: string;
  onCopied?: () => void;
  showLineNumbers?: boolean;
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
  copyText,
  copyLabel,
  onCopied,
  showLineNumbers = true,
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [copyError, setCopyError] = React.useState(false);
  const feedbackTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedTab = Math.min(activeTab, Math.max(0, tabs.length - 1));

  React.useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);

  React.useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [selectedTab, code, copyText]);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = copyText ?? (tabsExist ? tabs[selectedTab].code : code);
    if (textToCopy) {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      setCopied(false);
      setCopyError(false);
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        onCopied?.();
        feedbackTimer.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopyError(true);
      }
    }
  };

  const activeCode = tabsExist ? tabs[selectedTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[selectedTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[selectedTab].highlightLines || []
    : highlightLines;
  const label = copyLabel || (copyText !== undefined
    ? "复制作者原文"
    : tabsExist ? `复制${tabs[selectedTab].name}` : "复制内容");

  return (
    <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm">
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex  overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={selectedTab === index}
                onClick={() => setActiveTab(index)}
                className={`px-3 !py-2 text-xs transition-colors font-sans ${
                  selectedTab === index
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-zinc-400">{filename}</div>
            <button
              type="button"
              aria-label={label}
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              <span role="status" aria-live="polite">
                {copied ? "已复制" : copyError ? "复制失败，请手动选择" : label}
              </span>
            </button>
          </div>
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem", // text-sm equivalent
          overflow: "visible",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
        wrapLines={true}
        wrapLongLines={true}
        showLineNumbers={showLineNumbers}
        codeTagProps={{ style: { whiteSpace: "pre-wrap", overflowWrap: "anywhere" } }}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div"
      >
        {activeCode || ""}
      </SyntaxHighlighter>
    </div>
  );
};
