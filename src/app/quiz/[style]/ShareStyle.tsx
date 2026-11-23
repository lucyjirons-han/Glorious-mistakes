'use client';

import { Download, Share2 } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { styleHref, type StyleId } from '@/lib/quiz';
import { SITE_URL } from '@/lib/site';

/** Share the style's page (never anything personal), or download its card. */
export function ShareStyle({ styleId, name }: { styleId: StyleId; name: string }) {
  const toast = useToast();
  const url = `${SITE_URL}${styleHref(styleId)}`;

  const share = async () => {
    const text = `My mistake style is ${name}. What’s yours?`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${name} · Glorious Mistakes`, text, url });
        return;
      } catch (error) {
        // Closing the share sheet isn't an error worth mentioning.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied. Share away!');
    } catch {
      toast(`We couldn’t copy the link. It’s ${url}`);
    }
  };

  return (
    <div className="btn-row quiz-share">
      <button type="button" className="btn btn--primary" onClick={share}>
        <Icon icon={Share2} size={18} /> Share this style
      </button>
      <a className="btn btn--secondary" href={`/quiz/${styleId}/card`} download={`mistake-style-${styleId}.png`}>
        <Icon icon={Download} size={18} /> Download the card
      </a>
    </div>
  );
}
