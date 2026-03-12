'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Category, Restaurant } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

interface Props {
  restaurants: Restaurant[];
  categories: Category[];
  onChatOpen: (r: Restaurant) => void;
}

export default function MapClient({ restaurants, categories, onChatOpen }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const map = L.map(containerRef.current, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      zoomControl: false,
    });

    // CartoDB Dark tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control (يمين أسفل)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // تحديث الماركرز عند تغيير المطاعم
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet');

    // إزالة كل الماركرز القديمة
    map.eachLayer((layer: unknown) => {
      const l = layer as { options?: { isRestaurantMarker?: boolean } };
      if (l.options?.isRestaurantMarker) {
        (layer as { remove: () => void }).remove();
      }
    });

    restaurants.forEach(restaurant => {
      const cat = categoryMap[restaurant.category_id ?? 0];
      const color = cat?.color ?? '#3ecf8e';

      // Custom SVG marker
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${color};transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 12px rgba(0,0,0,0.4);
            border:2px solid rgba(255,255,255,0.2);
          ">
            <span style="transform:rotate(45deg);font-size:14px">${cat?.icon ?? '🍽️'}</span>
          </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([restaurant.lat, restaurant.lng], {
        icon,
        isRestaurantMarker: true,
      } as unknown as L.MarkerOptions);

      const stars = '⭐'.repeat(Math.round(restaurant.rating || 0));
      const popupHtml = `
        <div style="min-width:240px;font-family:'Cairo',sans-serif;direction:rtl">
          ${restaurant.cover_url ? `<img src="${restaurant.cover_url}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px"/>` : ''}
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            ${restaurant.logo_url ? `<img src="${restaurant.logo_url}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>` : ''}
            <div>
              <h3 style="font-size:16px;font-weight:700;color:#e2e8f0;margin:0">${restaurant.name}</h3>
              <span style="font-size:12px;color:${color}">${cat?.icon ?? ''} ${cat?.name ?? ''}</span>
            </div>
          </div>
          ${restaurant.description ? `<p style="font-size:13px;color:#94a3b8;margin-bottom:8px">${restaurant.description}</p>` : ''}
          <div style="display:flex;gap:12px;margin-bottom:10px;font-size:13px;color:#e2e8f0">
            <span>${stars || '☆'} ${restaurant.rating?.toFixed(1) ?? '0.0'}</span>
            <span>📦 ${restaurant.total_orders} طلب</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${restaurant.phone ? `<a href="tel:${restaurant.phone}" style="flex:1;text-align:center;padding:7px;border-radius:8px;background:rgba(62,207,142,0.15);color:#3ecf8e;font-size:13px;font-weight:600;text-decoration:none">📞 اتصال</a>` : ''}
            ${restaurant.whatsapp ? `<a href="https://wa.me/${restaurant.whatsapp}" target="_blank" style="flex:1;text-align:center;padding:7px;border-radius:8px;background:rgba(37,211,102,0.15);color:#25d366;font-size:13px;font-weight:600;text-decoration:none">💬 واتساب</a>` : ''}
            <button onclick="window.__openChat(${restaurant.id})" style="flex:1;text-align:center;padding:7px;border-radius:8px;background:rgba(139,92,246,0.2);color:#8b5cf6;font-size:13px;font-weight:600;border:none;cursor:pointer;font-family:Cairo,sans-serif">💬 دردشة</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      marker.addTo(map);
    });

    // register global chat opener
    (window as unknown as { __openChat: (id: number) => void }).__openChat = (id: number) => {
      const r = restaurants.find(x => x.id === id);
      if (r) onChatOpen(r);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants, categories]);

  return <div ref={containerRef} className="w-full h-full" />;
}
