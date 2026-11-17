import { Illustration, type IllustrationProps } from './Illustration';

/** A lightbulb that's a little crooked but glowing anyway. */
export function WonkyLightbulb({ className }: IllustrationProps) {
  return (
    <Illustration viewBox="18 4 172 172" className={className}>
      <path
        className="ill-wash ill-sage"
        d="M34 102c-4-40 26-72 68-72c40 0 70 26 68 66c-2 40-32 66-72 64c-38-2-60-24-64-58z"
      />
      <g transform="rotate(8 100 90)">
        {/* Bulb */}
        <path
          className="ill-paper"
          d="M86 118c-2-12-14-20-20-36c-8-22 6-50 34-52c28-2 44 22 38 46c-4 16-16 24-18 42z"
        />
        <path
          className="ill-sun ill-glow"
          d="M90 52c4-18 22-26 38-20c14 6 18 22 13 36c-5 14-18 22-32 19c-15-3-23-18-19-35z"
        />
        <path
          className="ill-ln"
          d="M86 116c-2-12-14-20-20-36c-8-22 6-50 34-52c28-2 44 22 38 46c-4 16-16 24-18 40"
        />
        <path className="ill-ln" d="M78 64c2-8 8-14 16-16" />
        {/* Filament */}
        <path className="ill-ln" d="M92 116c0-14-2-24-5-32M110 116c0-14 2-24 6-32M87 84c4-6 6 6 10 0s6 6 10 0s6 6 9 0" />
        {/* Screw base */}
        <path
          className="ill-accent ill-sky"
          d="M91 123c10 1 22 1 33 0c1 6 0 12-2 18c-9 2-19 2-28 0c-2-6-3-12-3-18z"
        />
        <path className="ill-paper" d="M86 118c11 2 23 2 34-1c1 7 0 14-3 21c-9 2-20 2-29 0c-3-6-3-13-2-20z" />
        <path
          className="ill-ln"
          d="M83 118c12 2 26 2 39-1M85 118c-1 7 0 14 3 20M120 116c1 7 0 14-3 22M86 125c10 2 22 2 32 0M87 132c10 2 21 2 31 0M88 139c8 2 20 2 28-1M95 140c2 7 13 7 15 0"
        />
      </g>
      {/* Glow marks */}
      <path
        className="ill-ln"
        d="M58 48q-8-6-11-16M42 84q-9 1-16-2M146 42q8-6 10-16M162 76q9 2 16-1M98 20q1-6 0-11M80 164q8 4 16 0M110 162q6 3 12 0"
      />
    </Illustration>
  );
}
