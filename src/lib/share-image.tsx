import { ImageResponse } from 'next/og';
import type { QuizStyle } from './quiz';
import { SITE_NAME } from './site';

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };
export const SHARE_IMAGE_ALT = 'Glorious Mistakes: Stuffed it up? Glorious.';

/** The default link preview image, drawn in the brand colours. */
export function renderShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#FAF7F0',
          color: '#1B1F4B',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#1B1F4B" />
            <path
              d="M32 16v32M18.1 24l27.8 16M18.1 40l27.8-16"
              fill="none"
              stroke="#F5C842"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1.05 }}>
            Stuffed it up?&nbsp;
            <span style={{ background: '#F5C842', padding: '0 16px', borderRadius: 16 }}>
              Glorious.
            </span>
          </div>
          <div style={{ fontSize: 38, color: '#454A72', maxWidth: 900 }}>
            Log the mistake, keep the lesson, and have a laugh about it.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['#C3B8E6', 'Own the oops'],
            ['#D0E8C6', 'Find the lesson'],
            ['#B0D3D0', 'Keep it or share it'],
          ].map(([bg, label]) => (
            <div
              key={label}
              style={{
                background: bg,
                borderRadius: 999,
                padding: '12px 28px',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}

/**
 * The share card for one mistake style (see ./quiz.ts): the style on its pastel, its strength
 * and growth edge, and an invitation to take the quiz. Served at /quiz/<style>/card.
 */
export function renderStyleShareImage(style: QuizStyle) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: 40,
          background: '#FAF7F0',
          color: '#1B1F4B',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 56px',
            background: style.hex,
            borderRadius: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <svg width="56" height="56" viewBox="0 0 64 64">
                <rect width="64" height="64" rx="16" fill="#1B1F4B" />
                <path
                  d="M32 16v32M18.1 24l27.8 16M18.1 40l27.8-16"
                  fill="none"
                  stroke="#F5C842"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ fontSize: 30, fontWeight: 700 }}>{SITE_NAME}</div>
            </div>
            <div
              style={{
                display: 'flex',
                background: '#FFFFFF',
                borderRadius: 999,
                padding: '10px 24px',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              My mistake style
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', fontSize: 112, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
              {style.name}
            </div>
            <div style={{ display: 'flex', fontSize: 38, color: '#454A72' }}>{style.tagline}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {[
                ['Strength', style.strength.short],
                ['Growth edge', style.edge.short],
              ].map(([label, text]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#FFFFFF',
                    borderRadius: 24,
                    padding: '14px 26px',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: '#454A72' }}>{label}</div>
                  <div style={{ display: 'flex', fontSize: 30, fontWeight: 700 }}>{text}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                background: '#1B1F4B',
                color: '#FAF7F0',
                borderRadius: 999,
                padding: '16px 30px',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              What’s yours?
            </div>
          </div>
        </div>
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}
