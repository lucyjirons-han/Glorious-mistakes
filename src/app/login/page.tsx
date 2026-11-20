import type { Metadata } from 'next';
import { safeNext } from '@/lib/login';
import { pageMetadata } from '@/lib/site';
import { LoginView } from './LoginView';

export const metadata: Metadata = pageMetadata({
  title: 'Log in',
  description: 'Log in with Google to keep your mistakes on every device.',
  path: '/login',
  noindex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  return <LoginView next={safeNext(typeof next === 'string' ? next : null)} />;
}
