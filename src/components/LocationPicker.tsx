'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

interface Props {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const center: [number, number] = lat && lng ? [lat, lng] : DEFAULT_MAP_CENTER;

    const map = L.map(containerRef.current, {
      center,
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:24px;height:24px;background:var(--color-primary);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = lat && lng
      ? L.marker([lat, lng], { icon, draggable: true }).addTo(map)
      : null;

    let currentMarker = marker;

    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      if (currentMarker) currentMarker.remove();
      currentMarker = L.marker([e.latlng.lat, e.latlng.lng], { icon, draggable: true }).addTo(map);
      onChange(e.latlng.lat, e.latlng.lng);

      currentMarker.on('dragend', (ev: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
        const { lat: la, lng: ln } = ev.target.getLatLng();
        onChange(la, ln);
      });
    });

    if (currentMarker) {
      currentMarker.on('dragend', (ev: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
        const { lat: la, lng: ln } = ev.target.getLatLng();
        onChange(la, ln);
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '8px' }}>
        انقر على الخريطة لتحديد موقع المطعم، أو اسحب الماركر
      </p>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '280px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)' }}
      />
      {lat && lng && (
        <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '6px', fontFamily: 'Fira Code, monospace' }}>
          📍 {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
