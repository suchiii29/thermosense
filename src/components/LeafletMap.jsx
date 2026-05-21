// src/components/LeafletMap.jsx – Robust single-init Leaflet map
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Temperature → colour
function getZoneColor(temp) {
  if (temp > 43) return '#7c3aed';
  if (temp > 40) return '#ef4444';
  if (temp > 37) return '#f59e0b';
  return '#3b82f6';
}

/**
 * Props
 * ─────
 * cityCenter  : [lat, lng] (already in Leaflet order)
 * cityZoom    : number
 * zones       : Zone[]
 * selectedZone: Zone | null
 * onZoneSelect: (zone) => void
 */
export default function LeafletMap({ cityCenter, cityZoom, zones, selectedZone, onZoneSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const isRemovedRef = useRef(false);

  // Stable callback ref so polygon click handlers never go stale
  const onZoneSelectRef = useRef(onZoneSelect);
  useEffect(() => { onZoneSelectRef.current = onZoneSelect; }, [onZoneSelect]);

  // ── MAP INIT (runs once) ──────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent double-init (React 18 StrictMode)
    if (mapRef.current) return;

    // If a previous Leaflet instance left its id on the DOM node, wipe it
    if (container._leaflet_id) {
      try { delete container._leaflet_id; } catch (_) { /* noop */ }
    }

    isRemovedRef.current = false;

    const map = L.map(container, {
      center: cityCenter || [20.5937, 78.9629], // fallback: center of India
      zoom: cityZoom || 11,
      zoomControl: false,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 5,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const lg = L.layerGroup().addTo(map);
    layerGroupRef.current = lg;

    // Cleanup on unmount
    return () => {
      isRemovedRef.current = true;
      if (layerGroupRef.current) {
        try { layerGroupRef.current.clearLayers(); } catch (_) { /* */ }
        try { layerGroupRef.current.remove(); } catch (_) { /* */ }
        layerGroupRef.current = null;
      }
      if (mapRef.current) {
        try { mapRef.current.off(); } catch (_) { /* */ }
        try { mapRef.current.remove(); } catch (_) { /* */ }
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← empty: init once

  // ── FLY TO CITY ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isRemovedRef.current) return;
    if (!cityCenter || !Array.isArray(cityCenter)) return;

    // _loaded is set by Leaflet after the first setView / flyTo
    if (map._loaded) {
      map.flyTo(cityCenter, cityZoom || 11, { duration: 1.2 });
    } else {
      map.setView(cityCenter, cityZoom || 11);
    }
  }, [cityCenter, cityZoom]);

  // ── DRAW POLYGONS ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg || isRemovedRef.current) return;

    // Clear old polygons first
    lg.clearLayers();

    if (!Array.isArray(zones) || zones.length === 0) return;

    zones.forEach((zone) => {
      try {
        const coords = zone.geojson?.geometry?.coordinates?.[0];
        if (!coords || !Array.isArray(coords) || coords.length < 3) return;

        // GeoJSON is [lng, lat]; Leaflet needs [lat, lng]
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        const color = getZoneColor(zone.temperature);
        const isSelected = selectedZone?.id === zone.id;

        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#facc15' : '#ffffff',
          weight: isSelected ? 2.5 : 1,
          fillColor: color,
          fillOpacity: isSelected ? 0.75 : 0.55,
        });

        polygon.bindTooltip(
          `<strong>${zone.name}</strong><br/>Heat Index: ${zone.temperature}°C`,
          { sticky: true, className: 'leaflet-tooltip-dark' }
        );

        polygon.on('click', () => {
          if (typeof onZoneSelectRef.current === 'function') {
            onZoneSelectRef.current(zone);
          }
        });

        // Never addTo(map) – always go through the layer group
        lg.addLayer(polygon);
      } catch (err) {
        console.warn('LeafletMap: skipped polygon for zone', zone?.id, err);
      }
    });
  }, [zones, selectedZone?.id]);

  return <div ref={containerRef} className="w-full h-full" />;
}
