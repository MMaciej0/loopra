// Mark viewBox aspect: 38.4 / 25.4
const MARK_ASPECT = 38.4 / 25.4;

interface LogoMarkProps {
  height?: number;
  className?: string;
}

export function LogoMark({ height = 24, className }: LogoMarkProps) {
  return (
    <svg
      width={height * MARK_ASPECT}
      height={height}
      viewBox="0 0 38.4 25.4"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M22.659 8.028A11 11 0 1 1 14.15 1.796" stroke="currentColor" strokeWidth="4.4" />
      <path d="M15.741 17.372A11 11 0 1 1 24.25 23.604" stroke="currentColor" strokeWidth="4.4" />
    </svg>
  );
}
