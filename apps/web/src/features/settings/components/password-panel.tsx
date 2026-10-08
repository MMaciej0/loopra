import { useTranslations } from 'next-intl';
import { Card, CardLabel } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ChangePasswordForm } from '@/features/settings/components/change-password-form';

type Props = Readonly<{
  hasPassword: boolean;
}>;

export function PasswordPanel({ hasPassword }: Props) {
  const t = useTranslations('SettingsPage.password');

  return (
    <Card>
      <CardLabel>{t('title')}</CardLabel>
      {hasPassword ? <ChangePasswordForm /> : <Text variant="body-m">{t('google')}</Text>}
    </Card>
  );
}
