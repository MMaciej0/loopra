import { ThemeButton } from '@/components/ui/theme-button';
import { FavoriteLocationPill } from './favorite-location-pill';
import { LogoutButton } from './logout-button';

export function UserSettingsPanel() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <FavoriteLocationPill />
      <LogoutButton />
      <ThemeButton />
    </div>
  );
}
