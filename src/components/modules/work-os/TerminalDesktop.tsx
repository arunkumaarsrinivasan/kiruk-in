"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildWorkDir, findDir, linkGlyph } from "./work-fs";
import type { DirNode, FsNode } from "./work-fs";
import type { DesktopEra, Project } from "./types";

interface TerminalDesktopProps {
  readonly era: DesktopEra;
  readonly projects: Project[];
}

type Line =
  | { kind: "cmd"; path: string; command: string }
  | { kind: "text"; lines: string[] }
  | { kind: "list"; at: string[]; nodes: FsNode[] }
  | { kind: "error"; text: string };

const HELP = [
  "commands:",
  "  ls              list this folder",
  "  cd <folder>     open a folder   (cd .. to go up)",
  "  cat <file>      read a file",
  "  open <link>     open a .url / .git / .fig in a new tab",
  "  tree            show the whole work tree",
  "  pwd · clear · help",
  "",
  "tip: you can also click any folder or file below.",
];

export function TerminalDesktop({ era, projects }: TerminalDesktopProps) {
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

  useEffect(() => {
    // boot banner + initial listing
    const start = dirAt([]);
    setHistory([
      { kind: "text", lines: [`KIRUK UNIX V6 — CRT terminal · ${era.year}`, "type 'help' or click a folder to begin.", ""] },
      { kind: "cmd", path: "~/work", command: "ls" },
      ...(start ? [{ kind: "list", at: [], nodes: start.children } as Line] : []),
    ]);
  }, [dirAt, era.year]);

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
        push({ kind: "cmd", path: promptPath(cwd), command: cmd }, here ? { kind: "list", at: cwd, nodes: here.children } : { kind: "error", text: "empty" });
        break;
      case "cd": {
        if (!arg || arg === "~") { openFolder([]); break; }
        openFolder(resolve(cwd, arg));
        break;
      }
      case "cat":
      case "open": {
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
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const last = recall[recall.length - 1];
      if (last) setInput(last);
    }
  };

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: t.wallpaper, color: t.text, fontFamily: era.fontUi }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* CRT overlays */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.14]" style={{ background: "repeating-linear-gradient(rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.55) 2px 3px)" }} />
      <div className="pointer-events-none absolute inset-0 z-20" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.7)" }} />

      <div ref={scrollRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-[1.65] [scrollbar-width:thin]">
        {history.map((line, i) => (
          <LineView key={i} line={line} t={t} onOpenFolder={openFolder} onOpenFile={openFile} />
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
            className="flex-1 bg-transparent caret-transparent outline-none"
            style={{ color: t.text, fontFamily: era.fontUi }}
            aria-label="terminal input"
          />
          <span className="-ml-2 inline-block h-[1.05em] w-[0.55em] animate-pulse" style={{ background: t.text }} />
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
}: {
  line: Line;
  t: DesktopEra["tokens"];
  onOpenFolder: (segs: string[]) => void;
  onOpenFile: (at: string[], node: FsNode) => void;
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
  if (line.kind === "text") {
    return (
      <pre className="whitespace-pre-wrap" style={{ color: t.text }}>
        {line.lines.join("\n")}
      </pre>
    );
  }
  // list — clickable folder/file entries
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-0.5">
      {line.nodes.map((n) => {
        const isDir = n.kind === "dir";
        const glyph = isDir ? "📁" : n.kind === "link" ? linkGlyph(n.linkType) : "📄";
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
            style={{ color: isDir ? t.accent : t.text }}
          >
            {glyph} {n.name}
            {isDir ? "/" : ""}
          </button>
        );
      })}
    </div>
  );
}
