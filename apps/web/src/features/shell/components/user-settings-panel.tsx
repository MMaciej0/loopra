import { ThemeButton } from '@/components/ui/theme-button';
import { LogoutButton } from '@/features/auth/components/logout-button';

export function UserSettingsPanel() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <LogoutButton />
      <ThemeButton />
    </div>
  );
}
