import { useTranslations } from 'next-intl';
import { Card, CardLabel } from '@/components/ui/card';
import { LanguageSelect } from '@/features/settings/components/language-select';
import { ThemeInput } from '@/features/settings/components/theme-input';

export function AppearancePanel() {
  const t = useTranslations('SettingsPage.appearance');

  return (
    <Card>
      <CardLabel>{t('title')}</CardLabel>
      <div className="flex flex-col gap-5">
        <ThemeInput />
        <LanguageSelect />
      </div>
    </Card>
  );
}
