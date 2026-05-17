'use client';

import { CircleAlert, Home, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  const t = useTranslations('ErrorPage');

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center">
        <div className="mb-8 flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          <CircleAlert className="size-5" aria-hidden />
        </div>
        <p className="font-data mb-3 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="font-editorial mb-3 text-4xl font-normal tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="mb-8 max-w-md text-sm leading-6 text-muted-foreground">{t('description')}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            {t('retry')}
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/">
              <Home className="size-4" aria-hidden />
              {t('home')}
            </Link>
          </Button>
        </div>
        {error.digest ? (
          <p className="font-data mt-8 text-[10px] tracking-wide text-muted-foreground">
            {t('reference')}: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
