import { getCurrentUser } from '@/utils/user';
import { FirstRunLocationDialog } from './dialog';

export async function FirstRunLocationPrompt() {
  const user = await getCurrentUser();

  if (!user || user.selected_location) {
    return null;
  }

  return <FirstRunLocationDialog />;
}
