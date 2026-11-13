import type { LucideIcon } from 'lucide-react';

export type Tone = 'lilac' | 'sage' | 'sky' | 'blush' | 'sun' | 'white' | 'neutral';

const BADGE_ICON_SIZE = { sm: 14, md: 20, lg: 26, xl: 32 } as const;

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

/** A decorative line icon: navy (or current colour) stroke, hidden from screen readers. */
export function Icon({ icon: Glyph, size = 18, className }: IconProps) {
  return (
    <Glyph
      className={className ? `icon ${className}` : 'icon'}
      size={size}
      strokeWidth={1.8}
      aria-hidden="true"
      focusable="false"
    />
  );
}

interface IconBadgeProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: keyof typeof BADGE_ICON_SIZE;
  className?: string;
}

/** A line icon sitting in a pastel circle, used wherever an emoji icon used to be. */
export function IconBadge({ icon, tone = 'lilac', size = 'md', className }: IconBadgeProps) {
  return (
    <span
      className={`icon-badge icon-badge--${tone} icon-badge--${size}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <Icon icon={icon} size={BADGE_ICON_SIZE[size]} />
    </span>
  );
}
