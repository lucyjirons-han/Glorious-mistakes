import type { ReactNode } from 'react';

interface EmptyStateProps {
  emoji: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, children, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__emoji" aria-hidden="true">
        {emoji}
      </p>
      <h2 className="empty-state__title">{title}</h2>
      {children && <div className="empty-state__text">{children}</div>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
