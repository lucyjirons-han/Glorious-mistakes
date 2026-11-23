import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { ArrowRight, NotebookPen, Sparkles, Sprout } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon, IconBadge } from '@/components/Icon';
import { isStyleId, QUIZ_STYLES, STYLE_IDS, STYLE_LIST, styleHref } from '@/lib/quiz';
import { pageMetadata } from '@/lib/site';
import { QuizResultPanel } from './QuizResultPanel';
import { ShareStyle } from './ShareStyle';

interface StylePageProps {
  params: Promise<{ style: string }>;
  searchParams: Promise<{ you?: string }>;
}

/** Only the five styles exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return STYLE_IDS.map((style) => ({ style }));
}

export async function generateMetadata({ params }: StylePageProps): Promise<Metadata> {
  const { style: id } = await params;
  if (!isStyleId(id)) return {};
  const style = QUIZ_STYLES[id];
  return pageMetadata({
    title: `${style.name}: a mistake style`,
    description: `${style.tagline} ${style.summary} Take the quiz to find your own mistake style.`,
    path: styleHref(id),
    image: {
      url: `/quiz/${id}/card`,
      alt: `My mistake style: ${style.name}. Strength: ${style.strength.short}. Growth edge: ${style.edge.short}.`,
    },
  });
}

export default async function StylePage({ params, searchParams }: StylePageProps) {
  const [{ style: id }, query] = await Promise.all([params, searchParams]);
  if (!isStyleId(id)) notFound();
  const style = QUIZ_STYLES[id];
  // ?you=1 is added when someone has just taken the quiz. Shared links leave it off.
  const you = query.you === '1';
  const others = STYLE_LIST.filter((s) => s.id !== id);

  return (
    <div className="container page page--narrow quiz-result">
      <header className="page-header">
        <p className="eyebrow">{you ? 'Your mistake style' : 'A mistake style'}</p>
        <h1 className="page-header__title">{you ? `You’re ${style.name}` : style.name}</h1>
        <p className="page-header__lead">{style.summary}</p>
      </header>

      <section
        className="quiz-card"
        style={{ '--quiz-tone': `var(--${style.tone})` } as CSSProperties}
        aria-labelledby="quiz-card-name"
      >
        <IconBadge icon={style.icon} tone="white" size="xl" className="quiz-card__icon" />
        <p className="quiz-card__eyebrow">Mistake style</p>
        <h2 id="quiz-card-name" className="quiz-card__name">
          {style.name}
        </h2>
        <p className="quiz-card__tagline">{style.tagline}</p>
        <dl className="quiz-card__traits">
          <div>
            <dt>Strength</dt>
            <dd>{style.strength.short}</dd>
          </div>
          <div>
            <dt>Growth edge</dt>
            <dd>{style.edge.short}</dd>
          </div>
        </dl>
      </section>
      <ShareStyle styleId={id} name={style.name} />

      <div className="quiz-traits">
        <section className="quiz-trait" aria-labelledby="quiz-strength">
          <IconBadge icon={Sparkles} tone="sage" size="lg" />
          <h2 id="quiz-strength" className="quiz-trait__title">
            <span className="quiz-trait__label">{you ? 'Your strength' : 'Strength'}</span>
            {style.strength.title}
          </h2>
          <p>{style.strength.text}</p>
        </section>
        <section className="quiz-trait" aria-labelledby="quiz-edge">
          <IconBadge icon={Sprout} tone="sky" size="lg" />
          <h2 id="quiz-edge" className="quiz-trait__title">
            <span className="quiz-trait__label">{you ? 'Your growth edge' : 'Growth edge'}</span>
            {style.edge.title}
          </h2>
          <p>{style.edge.text}</p>
        </section>
      </div>

      <section className="quiz-prompt" aria-labelledby="quiz-prompt-title">
        <IconBadge icon={NotebookPen} tone="sun" size="lg" className="quiz-prompt__icon" />
        <div className="quiz-prompt__body">
          <h2 id="quiz-prompt-title" className="quiz-prompt__title">
            {you ? 'Your next entry' : 'A mistake to log'}
          </h2>
          <p>{style.logPrompt}</p>
          <Link href={`/log?style=${id}`} className="btn btn--primary">
            Log a mistake like this
          </Link>
        </div>
      </section>

      <QuizResultPanel styleId={id} you={you} />

      <section className="quiz-others" aria-labelledby="quiz-others-title">
        <h2 id="quiz-others-title" className="section__title section__title--sm">
          Meet the other styles
        </h2>
        <ul className="quiz-others__list">
          {others.map((s) => (
            <li key={s.id}>
              <Link href={styleHref(s.id)} className="quiz-others__link">
                <IconBadge icon={s.icon} tone={s.tone} />
                <span>
                  <span className="quiz-others__name">{s.name}</span>
                  <span className="quiz-others__tagline">{s.tagline}</span>
                </span>
                <Icon icon={ArrowRight} size={18} className="quiz-others__arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
