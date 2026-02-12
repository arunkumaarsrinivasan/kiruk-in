'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  COMPONENT_CUSTOMIZATION_CONFIG,
  type CustomizableComponent,
  type ComponentProperty,
  type SavedComponentStyle,
  generateLabId,
} from '@/data/customization-lab-data';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ComponentCustomizerProps {
  eraId: string;
  eraAccent: string;
  eraBg: string;
  eraText: string;
  savedStyles: SavedComponentStyle[];
  onSaveStyle: (style: SavedComponentStyle) => void;
  onDeleteStyle: (id: string) => void;
}

type Overrides = Record<string, string | number | boolean>;

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTY EDITOR FIELD
// ═══════════════════════════════════════════════════════════════════════════════

function PropertyField({
  property,
  value,
  onChange,
  accentColor,
  textColor,
}: {
  property: ComponentProperty;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  accentColor: string;
  textColor: string;
}) {
  switch (property.type) {
    case 'color':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-[8px] font-mono uppercase" style={{ color: `${textColor}88` }}>
            {property.label}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={typeof value === 'string' && value.startsWith('#') ? value : '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 cursor-pointer bg-transparent border-none"
            />
            <span className="text-[7px] font-mono w-14 text-right" style={{ color: `${textColor}66` }}>
              {String(value).toUpperCase().slice(0, 7)}
            </span>
          </div>
        </div>
      );

    case 'slider':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-[8px] font-mono uppercase" style={{ color: `${textColor}88` }}>
            {property.label}
          </label>
          <div className="flex items-center gap-1 flex-1 max-w-[130px]">
            <input
              type="range"
              min={property.min ?? 0}
              max={property.max ?? 100}
              step={property.step ?? 1}
              value={Number(value)}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 h-1 accent-current"
              style={{ color: accentColor }}
            />
            <span className="text-[7px] font-mono w-8 text-right" style={{ color: textColor }}>
              {value}{property.unit ?? ''}
            </span>
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-[8px] font-mono uppercase" style={{ color: `${textColor}88` }}>
            {property.label}
          </label>
          <select
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            className="text-[8px] font-mono bg-transparent border px-1 py-0.5 max-w-[100px]"
            style={{ borderColor: `${textColor}22`, color: textColor }}
          >
            {property.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-[8px] font-mono uppercase" style={{ color: `${textColor}88` }}>
            {property.label}
          </label>
          <button
            onClick={() => onChange(!value)}
            className="px-2 py-0.5 text-[7px] font-mono border transition-all"
            style={{
              borderColor: value ? accentColor : `${textColor}33`,
              color: value ? '#000' : textColor,
              backgroundColor: value ? accentColor : 'transparent',
            }}
          >
            {value ? 'ON' : 'OFF'}
          </button>
        </div>
      );

    case 'number':
      return (
        <div className="flex items-center justify-between gap-2">
          <label className="text-[8px] font-mono uppercase" style={{ color: `${textColor}88` }}>
            {property.label}
          </label>
          <input
            type="number"
            min={property.min}
            max={property.max}
            step={property.step}
            value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 px-1 py-0.5 text-[8px] font-mono bg-transparent border text-right"
            style={{ borderColor: `${textColor}22`, color: textColor }}
          />
        </div>
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT PREVIEW RENDERER
// ═══════════════════════════════════════════════════════════════════════════════

function ComponentPreview({
  component,
  overrides,
  accentColor,
  bgColor,
  textColor,
}: {
  component: CustomizableComponent;
  overrides: Overrides;
  accentColor: string;
  bgColor: string;
  textColor: string;
}) {
  // Build style object from overrides
  const style = useMemo(() => {
    const s: React.CSSProperties = {};
    component.properties.forEach((prop) => {
      const val = overrides[prop.id] ?? prop.defaultValue;
      if (prop.type === 'toggle') {
        if (prop.cssProperty === 'textTransform') {
          (s as Record<string, string>).textTransform = val ? 'uppercase' : 'none';
        }
      } else if (prop.type === 'color') {
        let colorVal = String(val);
        // Resolve css vars for preview
        if (colorVal === 'var(--accent-color)') colorVal = accentColor;
        else if (colorVal === 'var(--bg-main)') colorVal = bgColor;
        else if (colorVal === 'var(--bg-card)') colorVal = bgColor;
        else if (colorVal === 'var(--text-main)') colorVal = textColor;
        else if (colorVal === 'var(--border-color)') colorVal = `${textColor}33`;
        (s as Record<string, string>)[prop.cssProperty] = colorVal;
      } else if (prop.cssProperty.startsWith('--')) {
        // CSS custom properties
        (s as Record<string, string>)[prop.cssProperty] = `${val}${prop.unit ?? ''}`;
      } else {
        (s as Record<string, string>)[prop.cssProperty] = typeof val === 'number' ? `${val}${prop.unit ?? 'px'}` : String(val);
      }
    });
    return s;
  }, [component, overrides, accentColor, bgColor, textColor]);

  // Compute box shadow from custom properties
  const boxShadowStyle = useMemo(() => {
    const shadowX = overrides['shadow-x'] ?? 0;
    const shadowY = overrides['shadow-y'] ?? 0;
    const shadowColor = String(overrides['shadow-color'] ?? '#000000');
    if (Number(shadowX) === 0 && Number(shadowY) === 0) return {};
    return { boxShadow: `${shadowX}px ${shadowY}px 0px 0px ${shadowColor}` };
  }, [overrides]);

  const fillColor = useMemo(() => {
    let c = String(overrides['fill-bg'] ?? 'var(--accent-color)');
    if (c === 'var(--accent-color)') c = accentColor;
    return c;
  }, [overrides, accentColor]);

  switch (component.previewType) {
    case 'button':
      return (
        <div className="flex items-center justify-center p-4">
          <button style={{ ...style, fontFamily: 'var(--font-main, monospace)', ...boxShadowStyle }}>
            {component.name}
          </button>
        </div>
      );

    case 'card':
      return (
        <div className="p-3">
          <div style={{ ...style, ...boxShadowStyle }}>
            <div className="text-xs font-bold mb-1" style={{ color: textColor, fontFamily: 'var(--font-main, monospace)' }}>
              Card Title
            </div>
            <div className="text-[9px] opacity-70" style={{ color: textColor }}>
              Card description with custom styling applied.
            </div>
          </div>
        </div>
      );

    case 'badge':
      return (
        <div className="flex gap-2 items-center justify-center p-4 flex-wrap">
          <span style={{ ...style, fontFamily: 'var(--font-main, monospace)', display: 'inline-block' }}>
            STATUS
          </span>
          <span style={{ ...style, fontFamily: 'var(--font-main, monospace)', display: 'inline-block', opacity: 0.7 }}>
            LABEL
          </span>
          <span style={{
            ...style,
            fontFamily: 'var(--font-main, monospace)',
            display: 'inline-block',
            backgroundColor: 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: textColor,
            color: textColor,
          }}>
            #TAG
          </span>
        </div>
      );

    case 'input':
      return (
        <div className="p-4">
          <input
            type="text"
            placeholder="Type something..."
            readOnly
            style={{ ...style, width: '100%', fontFamily: 'var(--font-main, monospace)', outline: 'none' }}
          />
        </div>
      );

    case 'progress':
      return (
        <div className="p-4 space-y-2">
          <div style={{ ...style, overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: '65%', height: '100%', backgroundColor: fillColor, position: 'absolute', top: 0, left: 0 }} />
          </div>
          <div className="text-[8px] font-mono text-center" style={{ color: `${textColor}66` }}>65%</div>
        </div>
      );

    case 'avatar':
      return (
        <div className="flex items-center justify-center p-4 gap-3">
          <div style={{
            ...style,
            height: style.width,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-main, monospace)',
            fontSize: '14px',
            color: textColor,
            borderStyle: 'solid',
          }}>
            AK
          </div>
          <div style={{
            ...style,
            height: style.width,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'solid',
          }}>
            🎨
          </div>
        </div>
      );

    case 'tooltip':
      return (
        <div className="flex items-center justify-center p-6">
          <div className="relative">
            <div style={{ ...style, fontFamily: 'var(--font-main, monospace)', whiteSpace: 'nowrap' }}>
              Tooltip text here
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
              style={{ backgroundColor: style.backgroundColor }}
            />
          </div>
        </div>
      );

    default:
      return <div className="p-4 text-[9px] font-mono" style={{ color: textColor }}>Preview not available</div>;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT CUSTOMIZER
// ═══════════════════════════════════════════════════════════════════════════════

export function ComponentCustomizer({
  eraId,
  eraAccent,
  eraBg,
  eraText,
  savedStyles,
  onSaveStyle,
  onDeleteStyle,
}: ComponentCustomizerProps) {
  const config = COMPONENT_CUSTOMIZATION_CONFIG;
  const categories = useMemo(() =>
    [...new Set(config.components.map(c => c.category))],
    [config.components]
  );

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeComponentId, setActiveComponentId] = useState(config.components[0].id);
  const [overrides, setOverrides] = useState<Record<string, Overrides>>({});
  const [styleName, setStyleName] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const activeComponent = useMemo(() =>
    config.components.find(c => c.id === activeComponentId) ?? config.components[0],
    [config.components, activeComponentId]
  );

  const filteredComponents = useMemo(() =>
    config.components.filter(c => c.category === activeCategory),
    [config.components, activeCategory]
  );

  const currentOverrides = useMemo(() =>
    overrides[activeComponentId] ?? {},
    [overrides, activeComponentId]
  );

  // Update a property override
  const handlePropertyChange = useCallback((propId: string, value: string | number | boolean) => {
    setOverrides(prev => ({
      ...prev,
      [activeComponentId]: {
        ...prev[activeComponentId],
        [propId]: value,
      },
    }));
  }, [activeComponentId]);

  // Reset component to defaults
  const handleReset = useCallback(() => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[activeComponentId];
      return next;
    });
  }, [activeComponentId]);

  // Apply a quick preset
  const handleApplyPreset = useCallback((presetId: string) => {
    const preset = config.quickPresets.find(p => p.id === presetId);
    if (!preset) return;
    setOverrides(prev => {
      const next = { ...prev };
      Object.entries(preset.overrides).forEach(([compId, compOverrides]) => {
        next[compId] = { ...(next[compId] ?? {}), ...compOverrides };
      });
      return next;
    });
  }, [config.quickPresets]);

  // Save current style
  const handleSave = useCallback(() => {
    const name = styleName.trim() || `${activeComponent.name} Style`;
    const style: SavedComponentStyle = {
      id: generateLabId(),
      name,
      componentId: activeComponentId,
      overrides: currentOverrides,
      createdAt: new Date().toISOString(),
      eraId,
    };
    onSaveStyle(style);
    setStyleName('');
  }, [styleName, activeComponent.name, activeComponentId, currentOverrides, eraId, onSaveStyle]);

  // Load saved style
  const handleLoadSaved = useCallback((saved: SavedComponentStyle) => {
    setOverrides(prev => ({
      ...prev,
      [saved.componentId]: { ...saved.overrides },
    }));
    setActiveComponentId(saved.componentId);
    const comp = config.components.find(c => c.id === saved.componentId);
    if (comp) setActiveCategory(comp.category);
    setShowSaved(false);
  }, [config.components]);

  // Generate CSS code for current overrides
  const cssCode = useMemo(() => {
    const lines: string[] = [`.custom-${activeComponentId} {`];
    activeComponent.properties.forEach((prop) => {
      const val = currentOverrides[prop.id];
      if (val !== undefined && val !== prop.defaultValue) {
        if (prop.type === 'toggle') {
          lines.push(`  ${prop.cssProperty}: ${val ? 'uppercase' : 'none'};`);
        } else if (typeof val === 'number') {
          lines.push(`  ${prop.cssProperty}: ${val}${prop.unit ?? 'px'};`);
        } else {
          lines.push(`  ${prop.cssProperty}: ${val};`);
        }
      }
    });
    lines.push('}');
    return lines.length > 2 ? lines.join('\n') : '';
  }, [activeComponent, activeComponentId, currentOverrides]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[9px] uppercase flex items-center gap-2" style={{ color: eraAccent }}>
          <span>◆</span> COMPONENT CUSTOMIZER
        </div>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="px-2 py-0.5 text-[8px] font-mono border transition-all"
          style={{
            borderColor: showSaved ? eraAccent : `${eraText}33`,
            color: showSaved ? eraBg : eraText,
            backgroundColor: showSaved ? eraAccent : 'transparent',
          }}
        >
          SAVED ({savedStyles.length})
        </button>
      </div>

      {/* Saved styles panel */}
      <AnimatePresence>
        {showSaved && savedStyles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-1 flex-wrap p-2 border border-dashed" style={{ borderColor: `${eraText}22` }}>
              {savedStyles.map((s) => (
                <div key={s.id} className="flex items-center gap-1 group">
                  <button
                    onClick={() => handleLoadSaved(s)}
                    className="px-2 py-1 text-[7px] font-mono border hover:border-current transition-all"
                    style={{ borderColor: `${eraText}22`, color: eraText }}
                  >
                    {s.name}
                  </button>
                  <button
                    onClick={() => onDeleteStyle(s.id)}
                    className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#ff4444' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Presets */}
      <div>
        <div className="text-[8px] font-mono uppercase mb-1" style={{ color: `${eraText}66` }}>Quick Presets</div>
        <div className="flex gap-1 flex-wrap">
          {config.quickPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className="px-2 py-1 text-[7px] font-mono border transition-all hover:border-current"
              style={{ borderColor: `${eraText}22`, color: eraText }}
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={() => setOverrides({})}
            className="px-2 py-1 text-[7px] font-mono border transition-all"
            style={{ borderColor: `${eraText}22`, color: `${eraText}66` }}
          >
            RESET ALL
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              const first = config.components.find(c => c.category === cat);
              if (first) setActiveComponentId(first.id);
            }}
            className="px-2 py-1 text-[8px] font-mono uppercase border transition-all whitespace-nowrap"
            style={{
              borderColor: activeCategory === cat ? eraAccent : `${eraText}22`,
              color: activeCategory === cat ? eraBg : eraText,
              backgroundColor: activeCategory === cat ? eraAccent : 'transparent',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component Selection within Category */}
      <div className="flex gap-1 flex-wrap">
        {filteredComponents.map((comp) => (
          <button
            key={comp.id}
            onClick={() => setActiveComponentId(comp.id)}
            className={cn('px-2 py-1 text-[8px] font-mono border transition-all flex items-center gap-1')}
            style={{
              borderColor: activeComponentId === comp.id ? eraAccent : `${eraText}22`,
              color: activeComponentId === comp.id ? eraAccent : `${eraText}88`,
            }}
          >
            <span>{comp.icon}</span> {comp.name}
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-col lg:flex-row">
        {/* Left: Property Controls */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[8px] font-mono" style={{ color: `${eraText}66` }}>
              {activeComponent.description}
            </div>
            <button
              onClick={handleReset}
              className="text-[7px] font-mono px-1.5 py-0.5 border transition-all"
              style={{ borderColor: `${eraText}22`, color: `${eraText}66` }}
            >
              RESET
            </button>
          </div>

          <div className="space-y-1.5 p-2 border" style={{ borderColor: `${eraText}11` }}>
            {activeComponent.properties.map((prop) => (
              <PropertyField
                key={prop.id}
                property={prop}
                value={currentOverrides[prop.id] ?? prop.defaultValue}
                onChange={(val) => handlePropertyChange(prop.id, val)}
                accentColor={eraAccent}
                textColor={eraText}
              />
            ))}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-mono uppercase mb-1" style={{ color: `${eraText}66` }}>Live Preview</div>
          <div
            className="border-2 min-h-[120px] flex items-center justify-center"
            style={{ borderColor: `${eraText}22`, backgroundColor: `${eraBg}CC` }}
          >
            <ComponentPreview
              component={activeComponent}
              overrides={currentOverrides}
              accentColor={eraAccent}
              bgColor={eraBg}
              textColor={eraText}
            />
          </div>

          {/* CSS Output */}
          {cssCode && (
            <div className="mt-2">
              <div className="text-[7px] font-mono uppercase mb-0.5" style={{ color: `${eraText}44` }}>CSS Output</div>
              <pre
                className="p-2 text-[7px] font-mono overflow-x-auto border"
                style={{ borderColor: `${eraText}11`, color: `${eraText}88` }}
              >
                {cssCode}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-1 items-center">
        <input
          type="text"
          value={styleName}
          onChange={(e) => setStyleName(e.target.value)}
          placeholder="Style name..."
          maxLength={32}
          className="flex-1 px-2 py-1 text-[9px] font-mono border bg-transparent"
          style={{ borderColor: `${eraText}22`, color: eraText }}
        />
        <button
          onClick={handleSave}
          className="px-3 py-1 text-[8px] font-mono font-bold uppercase transition-all"
          style={{ backgroundColor: eraAccent, color: eraBg }}
        >
          SAVE STYLE
        </button>
      </div>
    </div>
  );
}

export default ComponentCustomizer;
