"use client";

import React, { useState } from "react";
import { useDesignEra } from "@/contexts/DesignEraContext";
import { getFooterEraFlavor } from "@/data/footer-era-flavor";
import { getFooterGameId } from "@/data/footer-game-map";
import { resolveFooterData } from "@/data/footer-data";
import { portfolioData } from "@/data/portfolio-data";
import { getFooterPanelChrome } from "@/components/footer/footer-panel-styles";
import { FooterGame } from "@/components/footer/FooterGame";

export default function FooterGameFull() {
  const { currentEra, currentEraId } = useDesignEra();
  const flavor = getFooterEraFlavor(currentEra);
  const gameId = getFooterGameId(currentEraId);
  const data = resolveFooterData(currentEra, portfolioData);
  const chrome = getFooterPanelChrome(data.palette);
  const [resetNonce, setResetNonce] = useState(0);

  const boardHeight =
    typeof window !== "undefined"
      ? Math.min(520, Math.max(280, window.innerHeight - 180))
      : 400;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto px-4 pb-6 pt-2 sm:px-8">
      <div
        className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em]"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-base font-bold normal-case tracking-normal sm:text-lg" style={{ color: "var(--text-main)" }}>
          {flavor.questName}
        </span>
        <button
          type="button"
          onClick={() => setResetNonce((n) => n + 1)}
          className="hover:underline"
          style={{ color: "var(--accent-color)" }}
        >
          reset
        </button>
      </div>

      <div
        className={`mx-auto w-full max-w-4xl flex-1 overflow-hidden border ${chrome.gameShellClass}`}
        style={{
          borderColor: "var(--border-color)",
          ...chrome.gameShellStyle,
        }}
      >
        <FooterGame
          key={`full-${gameId}-${resetNonce}`}
          gameId={gameId}
          height={boardHeight}
          pixelated={data.palette.pixelated}
          scanlines={chrome.scanlines}
          canvasClassName={chrome.canvasClass}
          resetNonce={resetNonce}
        />
      </div>
    </div>
  );
}
