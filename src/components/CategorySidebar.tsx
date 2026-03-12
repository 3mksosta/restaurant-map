'use client';

import type { Category } from '@/types';

interface Props {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategorySidebar({ categories, selected, onSelect }: Props) {
  const items = [
    { id: null, name: 'الكل', icon: '🗺️', color: '#3ecf8e' },
    ...categories,
  ];

  return (
    <>
      {/* Desktop: يمين الشاشة عمودي */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex-col gap-2">
        {items.map(cat => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id ?? 'all'}
              onClick={() => onSelect(cat.id)}
              title={cat.name}
              style={{
                background: isSelected ? `${cat.color}22` : 'var(--color-card)',
                border: `1.5px solid ${isSelected ? cat.color : 'var(--color-border)'}`,
                color: isSelected ? cat.color : 'var(--color-muted)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
              }}
              className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl cursor-pointer min-w-[64px]"
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: أسفل الشاشة أفقي */}
      <div
        className="md:hidden absolute bottom-6 left-0 right-0 z-[1000] flex gap-2 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map(cat => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id ?? 'all'}
              onClick={() => onSelect(cat.id)}
              style={{
                background: isSelected ? `${cat.color}22` : 'var(--color-card)',
                border: `1.5px solid ${isSelected ? cat.color : 'var(--color-border)'}`,
                color: isSelected ? cat.color : 'var(--color-muted)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer"
            >
              <span style={{ fontSize: '16px' }}>{cat.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
