import { ArrowRight, Hand, HeartHandshake, Laugh, Lightbulb, NotebookPen, ScanFace, Send, Trophy } from 'lucide-react';
import Link from 'next/link';
import { FeedPreview } from '@/components/FeedPreview';
import { Icon, IconBadge, type Tone } from '@/components/Icon';

const STEPS: { icon: typeof Hand; tone: Tone; title: string; text: string }[] = [
  {
    icon: NotebookPen,
    tone: 'lilac',
    title: 'Own the oops',
    text: 'Write down what happened. Headline, story, cringe level. Two minutes, tops.',
  },
  {
    icon: Lightbulb,
    tone: 'sage',
    title: 'Find the lesson',
    text: 'What did it teach you? Wise, practical or totally ridiculous, it all counts.',
  },
  {
    icon: Send,
    tone: 'sky',
    title: 'Keep it or share it',
    text: 'Save it privately, or post it to the feed and collect a few “been there”s.',
  },
];

const VALUES: { icon: typeof Hand; tone: Tone; title: string; text: string }[] = [
  { icon: Trophy, tone: 'lilac', title: 'Celebrate, don’t hide', text: 'Mistakes mean you tried something. That deserves a little party.' },
  { icon: ScanFace, tone: 'sage', title: 'Build a reflection habit', text: 'Two questions: what happened, and what did I take from it?' },
  { icon: HeartHandshake, tone: 'sky', title: 'You’re not alone', text: 'Somewhere out there, someone has done the exact same thing.' },
  { icon: Laugh, tone: 'blush', title: 'Keep it light', text: 'No judgement, no lectures. Just people laughing at themselves together.' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">
              The mistake appreciation society
            </p>
            <h1 id="hero-title" className="hero__title">
              Stuffed it up? <span className="highlight">Glorious.</span>
            </h1>
            <p className="hero__lead">
              Log the mistakes you make and the lessons they leave behind. Keep them private, or
              share them so everyone can see they&rsquo;re not the only one.
            </p>
            <div className="btn-row">
              <Link href="/log" className="btn btn--primary btn--lg">
                Log a mistake
              </Link>
              <Link href="/feed" className="btn btn--secondary btn--lg">
                Browse the feed
              </Link>
            </div>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="hero-card hero-card--back">
              <p className="hero-card__tags">
                <span className="tag tag--category card--food">Food &amp; cooking</span>
                <span className="tag tag--cringe">Big yikes</span>
              </p>
              <p className="hero-card__title">Microwaved a boiled egg</p>
              <p className="hero-card__lesson">Eggs are tiny grenades.</p>
            </div>
            <div className="hero-card hero-card--front">
              <p className="hero-card__tags">
                <span className="tag tag--category card--work">Work &amp; career</span>
                <span className="tag tag--cringe">Legendary</span>
              </p>
              <p className="hero-card__title">Said &ldquo;love you, bye&rdquo; to my boss</p>
              <p className="hero-card__lesson">Slow down at the end of calls.</p>
              <p className="hero-card__react">
                <IconBadge icon={Hand} tone="lilac" size="sm" /> Been there · 356
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section--tinted" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title" className="section__title">
            How it works
          </h2>
          <p className="section__lead">A tiny reflection habit with a big grin.</p>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`step step--${i + 1}`}>
                <IconBadge icon={step.icon} tone={step.tone} size="xl" className="step__icon" />
                <h3 className="step__title">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feed preview */}
      <section className="section" aria-labelledby="preview-title">
        <div className="container">
          <div className="section__header">
            <div>
              <h2 id="preview-title" className="section__title">
                Fan favourites
              </h2>
              <p className="section__lead">The mistakes everyone keeps saying &ldquo;been there&rdquo; to.</p>
            </div>
            <Link href="/feed" className="btn btn--ghost">
              See the whole feed <Icon icon={ArrowRight} size={18} />
            </Link>
          </div>
          <FeedPreview />
        </div>
      </section>

      {/* Values */}
      <section className="section section--tinted" aria-labelledby="why-title">
        <div className="container">
          <h2 id="why-title" className="section__title">
            Why celebrate mistakes?
          </h2>
          <ul className="values">
            {VALUES.map((v) => (
              <li key={v.title} className="value">
                <IconBadge icon={v.icon} tone={v.tone} size="lg" className="value__icon" />
                <div>
                  <h3 className="value__title">{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-band">
            <h2 id="cta-title" className="cta-band__title">
              Go on. What did you stuff up this week?
            </h2>
            <p>Nobody has to see it but you. Unless you want them to.</p>
            <Link href="/log" className="btn btn--accent btn--lg">
              Log it now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
