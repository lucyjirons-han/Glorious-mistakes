import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconBadge, type Tone } from './Icon';

interface EmptyStateProps {
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, tone = 'lilac', title, children, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <IconBadge icon={icon} tone={tone} size="xl" className="empty-state__icon" />
      <h2 className="empty-state__title">{title}</h2>
      {children && <div className="empty-state__text">{children}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
