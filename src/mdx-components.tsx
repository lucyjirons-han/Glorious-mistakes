import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

/**
 * How Markdown in the Learn articles turns into HTML. Links to other pages on the site use
 * Next's <Link> for instant navigation; links to other websites open normally.
 */
const components: MDXComponents = {
  a: ({ href = '', children, ...props }) =>
    href.startsWith('/') ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} rel="noopener" {...props}>
        {children}
      </a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
