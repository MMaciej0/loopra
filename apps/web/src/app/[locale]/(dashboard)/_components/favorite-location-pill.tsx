import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/utils/user';

export async function FavoriteLocationPill() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" className="rounded-full max-sm:size-9 max-sm:p-0">
      <MapPin />
      <span className="sr-only sm:not-sr-only">
        {user.favorite_city}, {user.favorite_country}
      </span>
    </Button>
  );
}
