"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { useModules } from "@/contexts/ModuleContext";
import { resolveFooterData } from "@/data/footer-data";
import { portfolioData } from "@/data/portfolio-data";
import { getFooterGameId } from "@/data/footer-game-map";
import { getFooterEraFlavor } from "@/data/footer-era-flavor";
import { getFooterPanelChrome } from "./footer-panel-styles";
import { FooterGame } from "./FooterGame";

export function EraFooter() {
  const { currentEra, currentEraId } = useDesignEra();
  const { open } = useModules();
  const expandRef = useRef<HTMLButtonElement>(null);

  const data = resolveFooterData(currentEra, portfolioData);
  const flavor = getFooterEraFlavor(currentEra);
  const gameId = getFooterGameId(currentEraId);
  const chrome = getFooterPanelChrome(data.palette);

  const [resetNonce, setResetNonce] = useState(0);

  const links = data.linkGroups.flatMap((g) => g.items);

  const openFullscreen = useCallback(() => {
    const el = expandRef.current;
    const rect = el?.getBoundingClientRect();
    open(
      "footer-game",
      rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : undefined,
    );
  }, [open]);

  return (
    <footer
      data-era-footer={currentEraId}
      data-panel={data.palette.panelStyle}
      data-footer-game-id={gameId}
      className={`relative w-full border-t px-4 py-6 sm:px-6 ${chrome.footerClass}`}
      style={{
        background: chrome.footerStyle.background ?? "var(--bg-card)",
        color: "var(--text-main)",
        borderColor: "var(--border-color)",
        ...chrome.footerStyle,
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <section
          className={`overflow-hidden border ${chrome.gameShellClass} ${chrome.phosphorPulse ? "footer-game-pulse" : ""}`}
          style={{
            borderColor: "var(--border-color)",
            borderRadius:
              chrome.gameShellStyle.borderRadius ?? "var(--era-radius-md, 8px)",
            ...chrome.gameShellStyle,
          }}
          aria-label={flavor.questName}
        >
          <div
            className="flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em]"
            style={{
              borderBottom: "1px solid var(--border-color)",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ color: "var(--accent-color)" }}>
              {flavor.questName}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setResetNonce((n) => n + 1)}
                className="hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                reset
              </button>
              <button
                ref={expandRef}
                type="button"
                onClick={openFullscreen}
                className="hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                expand
              </button>
            </div>
          </div>

          <FooterGame
            key={`${gameId}-${resetNonce}`}
            gameId={gameId}
            height={140}
            pixelated={data.palette.pixelated}
            scanlines={chrome.scanlines}
            canvasClassName={chrome.canvasClass}
          />
        </section>

        {links.length > 0 ? (
          <nav
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]"
            aria-label="Footer links"
          >
            {links.map((it) => (
              <a
                key={it.id}
                href={it.href}
                target={it.external ? "_blank" : undefined}
                rel={it.external ? "noopener noreferrer" : undefined}
                className="hover:underline"
                style={{ color: "var(--text-main)" }}
              >
                {it.label}
              </a>
            ))}
          </nav>
        ) : null}

        <p
          className="text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          {data.copyrightLine}
          <span className="mx-2 opacity-40" aria-hidden>
            ·
          </span>
          {data.eraLine}
        </p>
      </div>
    </footer>
  );
}

export default EraFooter;
