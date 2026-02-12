'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeConfig } from '@/data/portfolio-data';
import {
  LAB_TABS,
  DEFAULT_LAB_STATE,
  type SavedPixelIcon,
  type SavedComponentStyle,
  type CustomizationLabState,
} from '@/data/customization-lab-data';
import { PixelArtEditor } from './PixelArtEditor';
import { ComponentCustomizer } from './ComponentCustomizer';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CustomizationLabProps {
  era: ThemeConfig;
  onClose: () => void;
}

const STORAGE_KEY = 'kiruk-customization-lab';

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT TAB - Shows all saved icons and styles for export
// ═══════════════════════════════════════════════════════════════════════════════

function ExportTab({
  state,
  eraAccent,
  eraBg,
  eraText,
}: {
  state: CustomizationLabState;
  eraAccent: string;
  eraBg: string;
  eraText: string;
}) {
  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `customization-lab-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="font-mono text-[9px] uppercase flex items-center gap-2" style={{ color: eraAccent }}>
        <span>◆</span> EXPORT YOUR CREATIONS
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 p-3 border text-center" style={{ borderColor: `${eraText}22` }}>
          <div className="text-2xl font-bold font-mono" style={{ color: eraAccent }}>
            {state.savedIcons.length}
          </div>
          <div className="text-[8px] font-mono uppercase" style={{ color: `${eraText}66` }}>Icons Created</div>
        </div>
        <div className="flex-1 p-3 border text-center" style={{ borderColor: `${eraText}22` }}>
          <div className="text-2xl font-bold font-mono" style={{ color: eraAccent }}>
            {state.savedStyles.length}
          </div>
          <div className="text-[8px] font-mono uppercase" style={{ color: `${eraText}66` }}>Styles Saved</div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="space-y-2">
        <button
          onClick={handleExportJSON}
          disabled={state.savedIcons.length === 0 && state.savedStyles.length === 0}
          className="w-full py-2 text-[9px] font-mono font-bold uppercase border-2 transition-all disabled:opacity-30"
          style={{
            borderColor: eraAccent,
            color: eraBg,
            backgroundColor: eraAccent,
          }}
        >
          EXPORT ALL AS JSON
        </button>
      </div>

      {/* Saved Icons List */}
      {state.savedIcons.length > 0 && (
        <div>
          <div className="text-[8px] font-mono uppercase mb-2" style={{ color: `${eraText}66` }}>
            Saved Icons
          </div>
          <div className="space-y-1">
            {state.savedIcons.map((icon) => (
              <div key={icon.id} className="flex items-center justify-between p-1.5 border" style={{ borderColor: `${eraText}11` }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border" style={{ borderColor: `${eraText}22`, backgroundColor: `${eraText}08` }} />
                  <span className="text-[8px] font-mono" style={{ color: eraText }}>{icon.name}</span>
                </div>
                <span className="text-[7px] font-mono" style={{ color: `${eraText}44` }}>
                  {icon.size}×{icon.size} · {icon.eraId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Styles List */}
      {state.savedStyles.length > 0 && (
        <div>
          <div className="text-[8px] font-mono uppercase mb-2" style={{ color: `${eraText}66` }}>
            Saved Component Styles
          </div>
          <div className="space-y-1">
            {state.savedStyles.map((style) => (
              <div key={style.id} className="flex items-center justify-between p-1.5 border" style={{ borderColor: `${eraText}11` }}>
                <span className="text-[8px] font-mono" style={{ color: eraText }}>{style.name}</span>
                <span className="text-[7px] font-mono" style={{ color: `${eraText}44` }}>
                  {style.componentId} · {style.eraId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.savedIcons.length === 0 && state.savedStyles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[10px] font-mono" style={{ color: `${eraText}44` }}>
            No creations yet. Start by creating icons or customizing components!
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CUSTOMIZATION LAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CustomizationLab({ era, onClose }: CustomizationLabProps) {
  const [activeTab, setActiveTab] = useState(LAB_TABS[0].id);
  const [labState, setLabState] = useState<CustomizationLabState>(DEFAULT_LAB_STATE);

  const colors = era.colors;
  const eraAccent = colors?.accent ?? colors?.primary ?? '#00ff88';
  const eraBg = colors?.background ?? '#000000';
  const eraText = colors?.text ?? '#ffffff';

  // Load state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLabState(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load customization lab state:', e);
      }
    }
  }, []);

  // Persist state
  const persistState = useCallback((newState: CustomizationLabState) => {
    setLabState(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  }, []);

  // Icon handlers
  const handleSaveIcon = useCallback((icon: SavedPixelIcon) => {
    persistState({
      ...labState,
      savedIcons: [...labState.savedIcons, icon],
    });
  }, [labState, persistState]);

  const handleDeleteIcon = useCallback((id: string) => {
    persistState({
      ...labState,
      savedIcons: labState.savedIcons.filter(i => i.id !== id),
    });
  }, [labState, persistState]);

  // Style handlers
  const handleSaveStyle = useCallback((style: SavedComponentStyle) => {
    persistState({
      ...labState,
      savedStyles: [...labState.savedStyles, style],
    });
  }, [labState, persistState]);

  const handleDeleteStyle = useCallback((id: string) => {
    persistState({
      ...labState,
      savedStyles: labState.savedStyles.filter(s => s.id !== id),
    });
  }, [labState, persistState]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b-2 flex-shrink-0"
        style={{ borderColor: `${eraText}22`, backgroundColor: eraAccent }}
      >
        <h3 className="font-mono text-xs font-bold uppercase" style={{ color: eraBg }}>
          🔬 CUSTOMIZATION LAB — {era.id}
        </h3>
        <button
          onClick={onClose}
          className="font-mono text-xs font-bold hover:opacity-70 transition-opacity"
          style={{ color: eraBg }}
        >
          ✕
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b px-2 gap-1 flex-shrink-0" style={{ borderColor: `${eraText}22` }}>
        {LAB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-2 text-[9px] font-mono uppercase transition-all flex items-center gap-1.5"
            style={{
              color: activeTab === tab.id ? eraAccent : `${eraText}66`,
              borderBottom: activeTab === tab.id ? `2px solid ${eraAccent}` : '2px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'icons' && (
            <motion.div
              key="icons"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <PixelArtEditor
                eraId={era.id}
                eraAccent={eraAccent}
                eraBg={eraBg}
                eraText={eraText}
                onSaveIcon={handleSaveIcon}
                savedIcons={labState.savedIcons}
                onDeleteIcon={handleDeleteIcon}
              />
            </motion.div>
          )}

          {activeTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ComponentCustomizer
                eraId={era.id}
                eraAccent={eraAccent}
                eraBg={eraBg}
                eraText={eraText}
                savedStyles={labState.savedStyles}
                onSaveStyle={handleSaveStyle}
                onDeleteStyle={handleDeleteStyle}
              />
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <ExportTab
                state={labState}
                eraAccent={eraAccent}
                eraBg={eraBg}
                eraText={eraText}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CustomizationLab;
