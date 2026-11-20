import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import { AdminView } from './AdminView';

export const metadata: Metadata = pageMetadata({
  title: 'Admin',
  description: 'Manage entries, reactions, reports and newsletter subscribers.',
  path: '/admin',
  noindex: true,
});

export default function AdminPage() {
  return <AdminView />;
}
