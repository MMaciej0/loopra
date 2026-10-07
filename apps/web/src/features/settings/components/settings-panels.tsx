import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/ui/text';
import { EmailPanel } from '@/features/settings/components/email-panel';
import { ProfilePanel } from '@/features/settings/components/profile-panel';
import { getCurrentUser } from '@/lib/user';

export async function SettingsPanels() {
  const t = await getTranslations('SettingsPage');
  const user = await getCurrentUser();

  return (
    <div className="h-full lg:overflow-y-auto">
      <div className="mx-auto flex max-w-[720px] flex-col gap-[18px] px-1 pt-6 pb-12 md:px-3">
        <Text variant="heading-xl">{t('title')}</Text>
        {user && <ProfilePanel username={user.username ?? ''} />}
        {user && <EmailPanel email={user.email} />}
      </div>
    </div>
  );
}
