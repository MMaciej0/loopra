import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardLabel } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ResendVerificationEmail } from '@/features/settings/components/resend-verification-email';

type Props = Readonly<{
  email: string;
  emailVerified: boolean;
}>;

export function EmailPanel({ email, emailVerified }: Props) {
  const t = useTranslations('SettingsPage.email');

  return (
    <Card>
      <CardLabel>{t('title')}</CardLabel>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Text variant="body-m" className="break-all">
          {email}
        </Text>
        <Badge variant={emailVerified ? 'accent' : 'default'} size="sm">
          {emailVerified ? t('verified') : t('notVerified')}
        </Badge>
      </div>
      {!emailVerified && <ResendVerificationEmail email={email} />}
    </Card>
  );
}
