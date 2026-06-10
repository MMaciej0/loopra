import { getTranslations } from 'next-intl/server';

export async function AuthDivider() {
  const t = await getTranslations('Auth');

  return (
    <div className="mb-[18px] flex items-center gap-3">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground font-mono text-[11px] tracking-[0.1em]">
        {t('or')}
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
