"use client";

import { VT323 } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildWorkDir, findDir } from "./work-fs";
import type { DirNode, FsNode } from "./work-fs";
import { useFocusProject } from "./use-focus-project";
import type { DesktopEra, Project } from "./types";

interface TerminalDesktopProps {
  readonly era: DesktopEra;
  readonly projects: Project[];
  readonly focusId?: string;
}

const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap" });

type Line =
  | { kind: "cmd"; path: string; command: string }
  | { kind: "text"; lines: string[] }
  | { kind: "list"; at: string[]; nodes: FsNode[] }
  | { kind: "long"; nodes: FsNode[] }
  | { kind: "hint"; commands: string[] }
  | { kind: "error"; text: string };

const HELP = [
  "commands:",
  "  ls              list this folder   (ls -l for the long view)",
  "  cd <folder>     open a folder   (cd .. to go up)",
  "  cat <file>      read a file",
  "  open <link>     open a .url / .git / .fig in a new tab",
  "  tree            show the whole work tree",
  "  pwd · clear · help",
  "",
  "tip: you can also click any folder or file below.",
];

export function TerminalDesktop({ era, projects, focusId }: TerminalDesktopProps) {
  const t = era.tokens;
  const root = useMemo(() => buildWorkDir(projects, era.id), [projects]);
  const [cwd, setCwd] = useState<string[]>([]);
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [recall, setRecall] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const promptPath = (segs: string[]) => `~/work${segs.length ? "/" + segs.join("/") : ""}`;
  const dirAt = useCallback((segs: string[]) => findDir(root, segs), [root]);

  const motd = useMemo(
    () => [
      `kiruk studio — design engineering, ${root.children.length} projects in ~/work.`,
      "every folder is a case study. click a name, or cd into it.",
    ],
    [root],
  );

  useEffect(() => {
    // boot: banner, message of the day, then the long listing so the first screen is the work itself
    const start = dirAt([]);
    const first = start?.children[0]?.name;
    setHistory([
      { kind: "text", lines: [`KIRUK UNIX V6 · CRT terminal · ${era.year}`, ""] },
      { kind: "cmd", path: "~", command: "cat motd" },
      { kind: "text", lines: motd },
      { kind: "cmd", path: "~/work", command: "ls -l" },
      ...(start ? [{ kind: "long", nodes: start.children } as Line] : []),
      { kind: "hint", commands: ["help", "tree", ...(first ? [`cd ${first}`] : [])] },
    ]);
  }, [dirAt, era.year, motd]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const push = (...items: Line[]) => setHistory((h) => [...h, ...items]);

  const resolve = (segs: string[], arg: string): string[] => {
    if (arg.startsWith("/") || arg.startsWith("~")) return [];
    const out = [...segs];
    for (const part of arg.split("/")) {
      if (part === "" || part === ".") continue;
      if (part === "..") out.pop();
      else out.push(part);
    }
    return out;
  };

  const openFolder = useCallback(
    (segs: string[]) => {
      const dir = dirAt(segs);
      if (!dir) {
        push({ kind: "cmd", path: promptPath(cwd), command: `cd ${segs.join("/")}` }, { kind: "error", text: "no such folder" });
        return;
      }
      setCwd(segs);
      push({ kind: "cmd", path: promptPath(segs), command: "ls" }, { kind: "list", at: segs, nodes: dir.children });
    },
    [cwd, dirAt],
  );

  const openFile = useCallback(
    (at: string[], node: FsNode) => {
      if (node.kind === "link") {
        push({ kind: "cmd", path: promptPath(at), command: `open ${node.name}` }, { kind: "text", lines: [`→ opening ${node.href}`] });
        globalThis.open(node.href, "_blank", "noopener,noreferrer");
        return;
      }
      if (node.kind === "doc") {
        push({ kind: "cmd", path: promptPath(at), command: `cat ${node.name}` }, { kind: "text", lines: node.lines });
      }
    },
    [],
  );

  const tree = useCallback((): string[] => {
    const out: string[] = ["~/work"];
    root.children.forEach((proj, i) => {
      const last = i === root.children.length - 1;
      out.push(`${last ? "└─" : "├─"} ${proj.name}/`);
      if (proj.kind === "dir") {
        proj.children.forEach((f, j) => {
          const fl = j === proj.children.length - 1;
          out.push(`${last ? "   " : "│  "} ${fl ? "└─" : "├─"} ${f.name}`);
        });
      }
    });
    return out;
  }, [root]);

  const exec = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setRecall((r) => [...r, cmd]);
    const [op, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");
    const here = dirAt(cwd);

    switch (op) {
      case "help":
        push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "text", lines: HELP });
        break;
      case "clear":
        setHistory([]);
        break;
      case "pwd":
        push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "text", lines: [promptPath(cwd)] });
        break;
      case "tree":
        push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "text", lines: tree() });
        break;
      case "ls":
        push(
          { kind: "cmd", path: promptPath(cwd), command: cmd },
          !here
            ? { kind: "error", text: "empty" }
            : arg === "-l" && cwd.length === 0
              ? { kind: "long", nodes: here.children }
              : { kind: "list", at: cwd, nodes: here.children },
        );
        break;
      case "cd": {
        if (!arg || arg === "~") { openFolder([]); break; }
        openFolder(resolve(cwd, arg));
        break;
      }
      case "cat":
      case "open": {
        if (arg === "motd") {
          push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "text", lines: motd });
          break;
        }
        const node = here?.children.find((c) => c.name === arg);
        if (!node) {
          push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "error", text: `no such file: ${arg}` });
        } else if (node.kind === "dir") {
          push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "error", text: `${arg} is a folder — try: cd ${arg}` });
        } else {
          openFile(cwd, node);
        }
        break;
      }
      default:
        push({ kind: "cmd", path: promptPath(cwd), command: cmd }, { kind: "error", text: `command not found: ${op} — try 'help'` });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
    } else if (e.key === "Tab" && input.trim()) {
      // complete the last word against this folder; an empty prompt keeps Tab for focus moves
      e.preventDefault();
      const words = input.split(/\s+/);
      const partial = words[words.length - 1];
      const names = (dirAt(cwd)?.children ?? []).map((c) => c.name).filter((n) => n.toLowerCase().startsWith(partial.toLowerCase()));
      if (names.length === 1) setInput([...words.slice(0, -1), names[0]].join(" ") + (dirAt([...cwd, names[0]]) ? "/" : ""));
      else if (names.length > 1) push({ kind: "text", lines: [names.join("   ")] });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const last = recall[recall.length - 1];
      if (last) setInput(last);
    }
  };

  useFocusProject(focusId, (id) => openFolder([id]));

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: t.wallpaper, color: t.text, fontFamily: `${vt323.style.fontFamily}, ${era.fontUi}` }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* CRT overlays */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.14]" style={{ background: "repeating-linear-gradient(rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.55) 2px 3px)" }} />
      <div className="pointer-events-none absolute inset-0 z-20" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.7)" }} />

      <div
        ref={scrollRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-4 text-[22px] leading-[1.25] [scrollbar-width:thin] sm:px-8 sm:text-[26px] [&_:is(pre,p)]:[font-family:inherit] [&_:is(pre,p)]:[font-size:inherit]"
        style={{ textShadow: `0 0 6px ${t.text}59` }}
      >
        <div className="max-w-[110ch]">
        {history.map((line, i) => (
          <LineView key={i} line={line} t={t} onOpenFolder={openFolder} onOpenFile={openFile} onRun={exec} />
        ))}

        {/* live input */}
        <div className="mt-1 flex items-center gap-2">
          <span style={{ color: t.accent }}>{promptPath(cwd)}$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            className="max-w-full bg-transparent p-0 caret-transparent outline-none"
            style={{ color: t.text, font: "inherit", textShadow: "inherit", outline: "none", width: `${input.length + 0.5}ch` }}
            aria-label="terminal input"
          />
          <span className="inline-block h-[1em] w-[0.5em] shrink-0 animate-pulse motion-reduce:animate-none" style={{ background: t.text, boxShadow: `0 0 6px ${t.text}` }} />
        </div>
        </div>
      </div>
    </div>
  );
}

function LineView({
  line,
  t,
  onOpenFolder,
  onOpenFile,
  onRun,
}: {
  line: Line;
  t: DesktopEra["tokens"];
  onOpenFolder: (segs: string[]) => void;
  onOpenFile: (at: string[], node: FsNode) => void;
  onRun: (command: string) => void;
}) {
  if (line.kind === "cmd") {
    return (
      <p className="mt-1.5">
        <span style={{ color: t.accent }}>{line.path}$</span> {line.command}
      </p>
    );
  }
  if (line.kind === "error") {
    return <p style={{ color: "#ff6b6b" }}>{line.text}</p>;
  }
  if (line.kind === "hint") {
    return (
      <p className="mt-2" style={{ color: t.textMuted }}>
        try:{" "}
        {line.commands.map((c, i) => (
          <span key={c}>
            {i ? <span aria-hidden> · </span> : null}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRun(c); }}
              className="underline decoration-dotted underline-offset-4 hover:decoration-solid"
              style={{ color: t.accent, font: "inherit" }}
            >
              {c}
            </button>
          </span>
        ))}
      </p>
    );
  }
  if (line.kind === "long") {
    // `ls -l`: perms · year · category · name · one-line pitch
    return (
      <div className="flex flex-col">
        {line.nodes.map((n) => {
          if (n.kind !== "dir" || !n.project) return null;
          const p = n.project;
          return (
            <button
              key={n.name}
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenFolder([n.name]); }}
              className="group flex min-w-0 gap-[2ch] text-left"
              style={{ font: "inherit" }}
            >
              <span className="hidden shrink-0 sm:inline" style={{ color: t.textMuted }}>drwxr-xr-x</span>
              <span className="shrink-0 tabular-nums" style={{ color: t.textMuted }}>{p.timeline.startDate.slice(0, 4)}</span>
              <span className="hidden w-[7ch] shrink-0 md:inline" style={{ color: t.textMuted }}>{p.category}</span>
              <span className="w-[24ch] shrink-0 truncate group-hover:underline" style={{ color: t.accent }}>{n.name}/</span>
              <span className="hidden min-w-0 flex-1 truncate lg:inline">{p.description}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (line.kind === "text") {
    return (
      <pre className="whitespace-pre-wrap" style={{ color: t.text }}>
        {line.lines.join("\n")}
      </pre>
    );
  }
  // list — `ls -F` style: dir/ , link@ , plain files; every entry clickable
  return (
    <div className="flex flex-wrap gap-x-[3ch]">
      {line.nodes.map((n) => {
        const isDir = n.kind === "dir";
        const suffix = isDir ? "/" : n.kind === "link" ? "@" : "";
        return (
          <button
            key={n.name}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isDir) onOpenFolder([...line.at, n.name]);
              else onOpenFile(line.at, n);
            }}
            className="text-left underline-offset-2 hover:underline"
            style={{ color: isDir ? t.accent : t.text, font: "inherit" }}
          >
            {n.name}
            {suffix}
          </button>
        );
      })}
    </div>
  );
}
