import { useTranslations } from 'next-intl';
import { Text } from '@/components/ui/text';

export function SettingsPanels() {
  const t = useTranslations('SettingsPage');

  return (
    <div className="h-full lg:overflow-y-auto">
      <div className="mx-auto flex max-w-[720px] flex-col gap-[18px] px-1 pt-6 pb-12 md:px-3">
        <Text variant="heading-xl">{t('title')}</Text>
      </div>
    </div>
  );
}
