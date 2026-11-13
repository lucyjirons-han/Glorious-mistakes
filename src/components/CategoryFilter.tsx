'use client';

import { CATEGORIES } from '@/lib/constants';
import type { CategoryId } from '@/lib/types';

interface CategoryFilterProps {
  value: CategoryId | 'all';
  onChange: (value: CategoryId | 'all') => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const options = [{ id: 'all' as const, label: 'Everything' }, ...CATEGORIES];
  return (
    <div className="chip-group" role="group" aria-label="Filter by category">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`chip tint--${option.id}`}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
