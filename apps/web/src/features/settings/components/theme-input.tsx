'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { FormProvider, useForm } from 'react-hook-form';
import { RadioCardGroup } from '@/components/ui/radio-card-group';

type ThemeValues = { theme: string };

export function ThemeInput() {
  const t = useTranslations('SettingsPage.appearance');
  const { resolvedTheme, setTheme } = useTheme();
  const form = useForm<ThemeValues>({ values: { theme: resolvedTheme ?? '' } });

  return (
    <FormProvider {...form}>
      <form
        onChange={(event) => {
          if (event.target instanceof HTMLInputElement) setTheme(event.target.value);
        }}
        onSubmit={(event) => event.preventDefault()}
      >
        <RadioCardGroup<ThemeValues>
          name="theme"
          legend={t('themeLabel')}
          options={[
            { value: 'light', label: t('themeLight') },
            { value: 'dark', label: t('themeDark') },
          ]}
        />
      </form>
    </FormProvider>
  );
}
