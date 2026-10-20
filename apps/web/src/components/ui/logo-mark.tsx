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
      <circle cx="12.7" cy="12.7" r="11" stroke="currentColor" strokeWidth="4.4" />
      <circle cx="25.7" cy="12.7" r="11" stroke="currentColor" strokeWidth="4.4" />
      <path
        d="M 23.7 12.7 a 11 11 0 0 1 -22 0"
        stroke="currentColor"
        strokeWidth="4.4"
        fill="none"
      />
    </svg>
  );
}
