import { Home, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <main className="bg-background min-h-screen px-6 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-start justify-center">
        <div className="border-border bg-muted text-muted-foreground mb-8 flex size-12 items-center justify-center rounded-full border">
          <SearchX className="size-5" aria-hidden />
        </div>
        <p className="font-data text-muted-foreground mb-3 text-[10px] font-medium tracking-[0.14em] uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="font-editorial text-foreground mb-3 text-4xl font-normal tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md text-sm leading-6">{t('description')}</p>
        <Button asChild>
          <Link href="/">
            <Home className="size-4" aria-hidden />
            {t('home')}
          </Link>
        </Button>
      </div>
    </main>
  );
}
