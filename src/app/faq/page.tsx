import type { Metadata } from 'next';
import { CircleHelp, Database, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';
import { IconBadge, type Tone } from '@/components/Icon';
import { jsonLd, pageMetadata } from '@/lib/site';
import { ALL_QUESTIONS, answerText, FAQ_GROUPS, type Block, type Inline } from './questions';

export const metadata: Metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Is Glorious Mistakes anonymous? Where are entries stored? What does “been there” do? Straight answers to the questions people ask most.',
  path: '/faq',
});

const GROUP_STYLE: Record<string, { icon: typeof CircleHelp; tone: Tone }> = {
  basics: { icon: CircleHelp, tone: 'sun' },
  privacy: { icon: Database, tone: 'lilac' },
  posting: { icon: MessageCircle, tone: 'sky' },
};

function InlineText({ parts }: { parts: Inline[] }) {
  return parts.map((part, i) =>
    typeof part === 'string' ? (
      <Fragment key={i}>{part}</Fragment>
    ) : (
      <Link key={i} href={part.href}>
        {part.text}
      </Link>
    ),
  );
}

function Answer({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) =>
    'p' in block ? (
      <p key={i}>
        <InlineText parts={block.p} />
      </p>
    ) : (
      <ul key={i}>
        {block.list.map((item, j) => (
          <li key={j}>
            <InlineText parts={item} />
          </li>
        ))}
      </ul>
    ),
  );
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ALL_QUESTIONS.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: answerText(q.answer) },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(structuredData)} />

      <div className="container page page--narrow faq">
        <header className="page-header">
          <p className="eyebrow">FAQ</p>
          <h1 className="page-header__title">Questions, answered</h1>
          <p className="page-header__lead">
            The things people ask most, answered straight. No fine print, no fibs.
          </p>
        </header>

        <nav className="faq__toc" aria-labelledby="faq-toc-title" data-reveal data-reveal-stagger>
          <h2 id="faq-toc-title" className="faq__toc-title">
            Jump to a question
          </h2>
          <ul>
            {ALL_QUESTIONS.map((q) => (
              <li key={q.id}>
                <a href={`#${q.id}`}>{q.question}</a>
              </li>
            ))}
          </ul>
        </nav>

        {FAQ_GROUPS.map((group) => {
          const style = GROUP_STYLE[group.id];
          return (
            <section key={group.id} className="about__section" aria-labelledby={`faq-${group.id}`} data-reveal data-reveal-stagger>
              <h2 id={`faq-${group.id}`} className="section__title section__title--sm">
                {style && (
                  <IconBadge icon={style.icon} tone={style.tone} size="sm" className="heading-icon" />
                )}{' '}
                {group.title}
              </h2>
              <div className="faq__list" data-reveal-each>
                {group.questions.map((q) => (
                  <article key={q.id} className="faq__item" aria-labelledby={q.id}>
                    <h3 id={q.id} className="faq__question">
                      {q.question}
                    </h3>
                    <div className="faq__answer">
                      <Answer blocks={q.answer} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <p className="faq__more">
          Still curious? Have a read of the <Link href="/learn">Learn</Link> articles, or find out
          more <Link href="/about">about Glorious Mistakes</Link>.
        </p>
      </div>

      <section className="section about__cta" aria-labelledby="faq-cta">
        <div className="container" data-reveal data-reveal-stagger>
          <div className="cta-band">
            <h2 id="faq-cta" className="cta-band__title">
              Questions sorted. Got a stuff-up?
            </h2>
            <p>Two minutes, two questions. Nobody has to see it but you.</p>
            <div className="btn-row btn-row--center">
              <Link href="/log" className="btn btn--accent btn--lg">
                Log a mistake
              </Link>
              <Link href="/feed" className="btn btn--lg">
                Browse the feed
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
