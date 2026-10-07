import { useTranslations } from 'next-intl';
import { Card, CardLabel } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type Props = Readonly<{
  email: string;
}>;

export function EmailPanel({ email }: Props) {
  const t = useTranslations('SettingsPage.email');

  return (
    <Card>
      <CardLabel>{t('title')}</CardLabel>
      <Text variant="body-m" className="break-all">
        {email}
      </Text>
    </Card>
  );
}
