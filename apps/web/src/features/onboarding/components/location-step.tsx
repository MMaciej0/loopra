'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useRouter } from '@/i18n/navigation';
import { acceptDefaultSelectedLocation } from '@/features/locations/actions/accept-default-selected-location';
import { LocationModalBody } from '@/features/locations/components/location-modal/location-modal-body';
import { useLocationModal } from '@/features/locations/components/location-modal/use-location-modal';
import type { LocationSuggestion } from '@/features/locations/geocoding';

type Props = Readonly<{ favorites: LocationSuggestion[] }>;

export function LocationStep({ favorites }: Props) {
  const t = useTranslations('FavoriteLocation');
  const router = useRouter();
  const [isAcceptingDefault, startAcceptDefaultTransition] = useTransition();
  const showRidesList = () => router.replace('/rides');
  const modal = useLocationModal({
    favorites,
    selected: null,
    onApplied: showRidesList,
  });

  const acceptDefault = () => {
    if (isAcceptingDefault || modal.isApplying) return;

    modal.setErrorKey(null);
    startAcceptDefaultTransition(async () => {
      const result = await acceptDefaultSelectedLocation();

      if (result.ok) {
        showRidesList();
      } else {
        modal.setErrorKey('firstRun.defaultError');
      }
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <Text variant="label" className="text-muted-foreground">
          {t('firstRun.eyebrow')}
        </Text>
        <Text variant="heading-xl" as="h1">
          {t('title')}
        </Text>
        <Text variant="body-s" className="text-muted-foreground">
          {t('firstRun.description')}
        </Text>
      </header>

      <LocationModalBody modal={modal} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="ghost" loading={isAcceptingDefault} onClick={acceptDefault}>
          {t('firstRun.useDefault')}
        </Button>
        <Button
          variant="accent"
          disabled={!modal.canApply}
          loading={modal.isApplying}
          onClick={modal.showRides}
        >
          {t('showRides')}
        </Button>
      </div>
    </section>
  );
}
