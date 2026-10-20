import { useTranslations } from 'next-intl';
import { LogoMark } from '@/components/ui/logo-mark';
import { StagingIndicator } from '@/components/ui/staging-indicator';
import { Link } from '@/i18n/navigation';

const HEIGHT = 26;
const FONT_SIZE = HEIGHT * 0.92;
// Geist 700 cap height ≈ 0.72 × font-size
const CAP_RATIO = 0.72;
const MARK_HEIGHT = FONT_SIZE * CAP_RATIO * 0.76;

interface LogoProps {
  withStagingIndicator?: boolean;
}

export function Logo({ withStagingIndicator = false }: LogoProps) {
  const t = useTranslations('Logo');

  return (
    <div className="flex items-center gap-1.5">
      <Link href="/" aria-label={t('home')} className="text-foreground">
        <span
          className="font-ui inline-flex items-baseline"
          style={{
            height: HEIGHT,
            fontSize: FONT_SIZE,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          l
          <LogoMark height={MARK_HEIGHT} />
          <span style={{ marginLeft: '-0.04em' }}>pra</span>
        </span>
      </Link>
      {withStagingIndicator && <StagingIndicator />}
    </div>
  );
}
