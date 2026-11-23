import { isStyleId, QUIZ_STYLES, STYLE_IDS } from '@/lib/quiz';
import { renderStyleShareImage } from '@/lib/share-image';

/** The share card for each style at /quiz/<style>/card, used for link previews and downloads. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STYLE_IDS.map((style) => ({ style }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ style: string }> }) {
  const { style } = await params;
  if (!isStyleId(style)) return new Response('Not found', { status: 404 });
  return renderStyleShareImage(QUIZ_STYLES[style]);
}
