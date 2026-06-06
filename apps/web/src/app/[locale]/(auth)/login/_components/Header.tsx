import { Text } from '@/components/ui/text';
import { getTranslations } from 'next-intl/server';

export async function Header() {
  const t = await getTranslations('LoginPage');

  return (
    <header className="mb-[28px] flex flex-col gap-[10px]">
      <Text variant="label" className="text-muted-foreground">
        {t('eyebrow')}
      </Text>
      <Text variant="heading-xl" as="h1">
        {t.rich('heading', { i: (chunks) => <i>{chunks}</i> })}
      </Text>
    </header>
  );
}
