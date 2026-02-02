'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import maplibregl, { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDesignEra } from '@/contexts/DesignEraContext';
import { travelLocations, treks, getTravelStats, TravelLocation, Trek, LocationType } from '@/data/life-progress-data';

type MapMode = 'locations' | 'treks';

interface TravelMapProps {
  className?: string;
}

const markerColors: Record<LocationType, string> = {
  hometown: '#FF6B6B',
  current: '#7C3AED',
  visited: '#10B981',
  trek: '#F59E0B',
  work: '#3B82F6',
  study: '#EC4899',
};

const defaultCenter: [number, number] = [78.9629, 20.5937];
const darkTiles = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const lightTiles = 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// India states GeoJSON URL (Natural Earth simplified)
const INDIA_STATES_GEOJSON = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

const isTrek = (item: TravelLocation | Trek): item is Trek => 'elevation' in item;

const normalizeHex = (hex?: string) => {
  if (!hex) return null;
  const raw = hex.replace('#', '').trim();
  if (raw.length === 3) {
    return raw.split('').map((c) => c + c).join('');
  }
  return raw.length === 6 ? raw : null;
};

const getLuminance = (hex?: string) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0.5;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

// Get visited states from travel locations
const getVisitedStates = (): Set<string> => {
  const states = new Set<string>();
  travelLocations.forEach(loc => {
    if (loc.region) {
      states.add(loc.region);
    }
  });
  return states;
};

// State name mapping for GeoJSON matching
const stateNameMapping: Record<string, string[]> = {
  'Tamil Nadu': ['Tamil Nadu', 'TAMIL NADU'],
  'Karnataka': ['Karnataka', 'KARNATAKA'],
  'Kerala': ['Kerala', 'KERALA'],
  'Andhra Pradesh': ['Andhra Pradesh', 'ANDHRA PRADESH'],
  'Goa': ['Goa', 'GOA'],
  'West Bengal': ['West Bengal', 'WEST BENGAL'],
  'Himachal Pradesh': ['Himachal Pradesh', 'HIMACHAL PRADESH'],
};

// Icons for each location type (using Unicode/emoji symbols)
const locationIcons: Record<LocationType, string> = {
  hometown: '🏠',
  current: '📍',
  visited: '✓',
  trek: '⛰️',
  work: '💼',
  study: '📚',
};

const createMarkerElement = (color: string, type: LocationType | 'trek-item'): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'travel-marker';

  const icon = type === 'trek-item' ? '⛰️' : locationIcons[type];
  const isEmoji = icon.length > 1; // Emojis are multi-char

  el.style.cssText = `
    width: ${isEmoji ? '28px' : '24px'};
    height: ${isEmoji ? '28px' : '24px'};
    background-color: ${isEmoji ? 'transparent' : color};
    border: ${isEmoji ? 'none' : '2px solid #0b1224'};
    border-radius: ${isEmoji ? '0' : '4px'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${isEmoji ? '20px' : '14px'};
    font-weight: bold;
    color: ${isEmoji ? 'inherit' : '#0b1224'};
    cursor: pointer;
    box-shadow: ${isEmoji ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.4)'};
    text-shadow: ${isEmoji ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'};
  `;
  el.textContent = icon;
  return el;
};

const buildPopupHtml = (item: TravelLocation | Trek, mode: MapMode): string => {
  const isT = isTrek(item);
  const name = item.name;
  const region = 'region' in item ? item.region : undefined;
  const country = item.country;
  const type = isT ? 'trek' : (item as TravelLocation).type;
  const elevation = isT ? (item as Trek).elevation : undefined;
  const distance = isT ? (item as Trek).distance : undefined;
  const description = item.description;

  const titleLine = `<div class="popup-title">${name}</div>`;
  const regionLine = region ? `<div class="popup-sub">${region}</div>` : '';
  const countryLine = `<div class="popup-sub">${country}</div>`;

  const tag = mode === 'treks'
    ? '<span class="popup-tag">Trek</span>'
    : type
      ? `<span class="popup-tag">${type}</span>`
      : '';

  const trekMeta = isT && elevation != null && distance != null
    ? `<div class="popup-meta">↑ ${elevation} m · ${distance} km</div>`
    : '';

  const desc = description ? `<div class="popup-desc">${description}</div>` : '';

  return `
    <div class="popup-shell">
      ${titleLine}
      ${regionLine}
      ${countryLine}
      ${tag}
      ${trekMeta}
      ${desc}
    </div>
  `;
};

export function TravelMap({ className = '' }: TravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const popupRef = useRef<MapLibrePopup | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>('locations');
  const [mapReady, setMapReady] = useState(false);
  const { currentEra } = useDesignEra();

  const stats = useMemo(() => getTravelStats(), []);
  const visitedStates = useMemo(() => getVisitedStates(), []);
  const isDarkTheme = useMemo(
    () => getLuminance(currentEra?.colors?.background) < 0.45,
    [currentEra]
  );
  const mapTint = currentEra?.colors?.accent ?? 'var(--accent-color)';
  const mapTintStyle = useMemo<CSSProperties>(
    () => ({ '--map-tint': mapTint } as CSSProperties),
    [mapTint]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: defaultCenter,
      zoom: 4.5,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [darkTiles],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO',
          },
          'carto-light': {
            type: 'raster',
            tiles: [lightTiles],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO',
          },
        },
        layers: [
          {
            id: 'carto-dark',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 19,
            layout: { visibility: isDarkTheme ? 'visible' : 'none' },
          },
          {
            id: 'carto-light',
            type: 'raster',
            source: 'carto-light',
            minzoom: 0,
            maxzoom: 19,
            layout: { visibility: isDarkTheme ? 'none' : 'visible' },
          },
        ],
      },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    map.on('load', () => setMapReady(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle dark/light theme
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;
    if (map.getLayer('carto-dark')) {
      map.setLayoutProperty('carto-dark', 'visibility', isDarkTheme ? 'visible' : 'none');
    }
    if (map.getLayer('carto-light')) {
      map.setLayoutProperty('carto-light', 'visibility', isDarkTheme ? 'none' : 'visible');
    }
  }, [isDarkTheme, mapReady]);

  // Load India states GeoJSON and highlight visited states
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Add India states source if not exists
    if (!map.getSource('india-states')) {
      fetch(INDIA_STATES_GEOJSON)
        .then(res => res.json())
        .then((geojson) => {
          if (!mapRef.current) return;

          // Filter features to only include visited states  
          const visitedFeatures = geojson.features.filter((feature: { properties: { NAME_1?: string } }) => {
            const stateName = feature.properties?.NAME_1;
            if (!stateName) return false;

            // Check if this state is in our visited list
            for (const [ourState, aliases] of Object.entries(stateNameMapping)) {
              if (visitedStates.has(ourState)) {
                if (aliases.some(alias =>
                  stateName.toLowerCase() === alias.toLowerCase()
                )) {
                  return true;
                }
              }
            }
            // Direct match
            return visitedStates.has(stateName);
          });

          map.addSource('india-states', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: visitedFeatures,
            },
          });

          // Add fill layer for visited states
          map.addLayer({
            id: 'visited-states-fill',
            type: 'fill',
            source: 'india-states',
            paint: {
              'fill-color': '#10B981',
              'fill-opacity': 0.25,
            },
          }, 'carto-dark');

          // Add outline for visited states
          map.addLayer({
            id: 'visited-states-outline',
            type: 'line',
            source: 'india-states',
            paint: {
              'line-color': '#10B981',
              'line-width': 2,
              'line-opacity': 0.8,
            },
          }, 'carto-dark');
        })
        .catch(err => console.warn('Failed to load India states:', err));
    }
  }, [mapReady, visitedStates]);

  // Add markers for locations/treks
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const data = mapMode === 'locations' ? travelLocations : treks;

    // Create DOM markers
    data.forEach((item) => {
      const color = isTrek(item) ? markerColors.trek : markerColors[item.type];
      const markerType = isTrek(item) ? 'trek-item' : item.type;

      const el = createMarkerElement(color, markerType);

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([item.lng, item.lat])
        .addTo(map);

      // Add popup on click
      el.addEventListener('click', () => {
        popupRef.current?.remove();
        const popup = new MapLibrePopup({ offset: 15, closeButton: true })
          .setHTML(buildPopupHtml(item, mapMode))
          .setLngLat([item.lng, item.lat])
          .addTo(map);
        popupRef.current = popup;
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (data.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      data.forEach((item) => bounds.extend([item.lng, item.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: mapMode === 'treks' ? 10 : 8, duration: 600 });
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(4.5);
    }
  }, [mapMode, mapReady]);

  return (
    <div
      className={`travel-map-shell p-6 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: 'var(--border-width) solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-2xl font-mono uppercase tracking-wider"
            style={{ color: 'var(--text-main)' }}
          >
            Places I&apos;ve Been
          </h2>
          <p
            className="text-sm font-mono mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {stats.statesVisited} states · {stats.countriesVisited} countries · {stats.totalLocations} locations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMapMode('locations')}
            className="px-4 py-2 font-mono text-sm uppercase transition-all"
            style={{
              backgroundColor: mapMode === 'locations' ? 'var(--accent-color)' : 'transparent',
              color: mapMode === 'locations' ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            Locations
          </button>
          <button
            onClick={() => setMapMode('treks')}
            className="px-4 py-2 font-mono text-sm uppercase transition-all"
            style={{
              backgroundColor: mapMode === 'treks' ? 'var(--accent-color)' : 'transparent',
              color: mapMode === 'treks' ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            Treks
          </button>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{ border: '1px solid var(--border-color)', ...mapTintStyle }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: 400 }} />
        <div className="map-tint-overlay" aria-hidden="true" />
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {Object.entries(locationIcons).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span
              className="text-xs font-mono uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              {type}
            </span>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .travel-map-shell .maplibregl-canvas {
          image-rendering: pixelated;
          filter: contrast(1.08) saturate(0.92);
        }

        .travel-map-shell .map-tint-overlay {
          position: absolute;
          inset: 0;
          background: var(--map-tint, #22d3ee);
          opacity: 0.12;
          mix-blend-mode: multiply;
          pointer-events: none;
        }


        .maplibregl-popup-content {
          background: #0f172a;
          color: #e2e8f0;
          border: 2px solid #1e293b;
          border-radius: 0;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.45);
          font-family: 'Space Grotesk', 'IBM Plex Mono', monospace;
        }

        .maplibregl-popup-tip {
          background: #0f172a;
          border: 2px solid #1e293b;
        }

        .popup-shell {
          display: grid;
          gap: 4px;
        }

        .popup-title {
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .popup-sub {
          font-size: 12px;
          color: #94a3b8;
        }

        .popup-tag {
          display: inline-block;
          margin-top: 4px;
          padding: 3px 6px;
          background: #22d3ee;
          color: #0b1224;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .popup-meta {
          font-size: 12px;
          color: #cbd5e1;
        }

        .popup-desc {
          font-size: 12px;
          color: #e2e8f0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default TravelMap;
