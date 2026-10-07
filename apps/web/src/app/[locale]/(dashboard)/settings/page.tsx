import { PageBody } from '@/features/shell/components/page-body';
import { SettingsTopNav } from '@/features/settings/components/settings-top-nav';
import { SettingsPanels } from '@/features/settings/components/settings-panels';

export default function SettingsPage() {
  return (
    <>
      <SettingsTopNav />
      <PageBody>
        <SettingsPanels />
      </PageBody>
    </>
  );
}
