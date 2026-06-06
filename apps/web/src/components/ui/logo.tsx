import { cn } from '@/lib/utils';

interface LogoProps {
  height?: number;
  className?: string;
}

// Geist 700 cap height ≈ 0.72 × font-size
const CAP_RATIO = 0.72;
// Mark viewBox aspect: 38.4 / 25.4
const MARK_ASPECT = 38.4 / 25.4;

export function Logo({ height = 32, className }: LogoProps) {
  const fontSize = height * 0.92;
  const markHeight = fontSize * CAP_RATIO * 0.76;
  const markWidth = markHeight * MARK_ASPECT;

  return (
    <span
      className={cn('inline-flex items-baseline font-ui', className)}
      style={{ height, fontSize, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
    >
      l
      <svg
        width={markWidth}
        height={markHeight}
        viewBox="0 0 38.4 25.4"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block', flexShrink: 0 }}
      >
        <circle cx="12.7" cy="12.7" r="11" stroke="currentColor" strokeWidth="4.4" />
        <circle cx="25.7" cy="12.7" r="11" stroke="currentColor" strokeWidth="4.4" />
        <path d="M 23.7 12.7 a 11 11 0 0 1 -22 0" stroke="currentColor" strokeWidth="4.4" fill="none" />
      </svg>
      <span style={{ marginLeft: '-0.04em' }}>pra</span>
    </span>
  );
}
