import { ThemeButton } from '@/components/ui/theme-button';
import { LogoutButton } from './LogoutButton';

export function UserSettingsPanel() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <LogoutButton />
      <ThemeButton />
    </div>
  );
}
