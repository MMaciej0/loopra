'use client';

import { Check, Loader2, MapPin, Star, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import { cn } from '@/lib/utils';
import type { LocationSuggestion } from '@/lib/geocoding';
import { LocationPicker } from './picker';
import type { LocationModal } from './use-location-modal';

export { useLocationModal, type LocationModal } from './use-location-modal';

export function LocationModalBody({ modal }: Readonly<{ modal: LocationModal }>) {
  const t = useTranslations('FavoriteLocation');
  const comboboxPortalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={comboboxPortalRef}>
      <div className="flex flex-col gap-3">
        <LocationPicker
          key={modal.searchKey}
          value={modal.searchPick}
          onSelect={modal.pickFromSearch}
          portalContainer={comboboxPortalRef}
        />

        {modal.shown && (
          <ShownLocationRow
            location={modal.shown}
            isPending={modal.isShownPending}
            canSave={modal.canSaveShown && !modal.isFull}
            onSave={modal.saveShownAsFavorite}
            isSaving={modal.isSavingFavorite}
          />
        )}

        <FavoritesList
          favorites={modal.favorites}
          isSelected={modal.isSelected}
          isPending={modal.isPending}
          onPick={modal.pickFavorite}
          onDelete={modal.deleteFavorite}
          deletingId={modal.deletingFavoriteId}
          note={modal.canSaveShown && modal.isFull ? t('favorites.full') : null}
        />

        {modal.errorKey && <p className="text-destructive text-xs">{t(modal.errorKey)}</p>}
      </div>
    </div>
  );
}

function ShownLocationRow({
  location,
  isPending,
  canSave,
  onSave,
  isSaving,
}: Readonly<{
  location: LocationSuggestion;
  isPending: boolean;
  canSave: boolean;
  onSave: () => void;
  isSaving: boolean;
}>) {
  const t = useTranslations('FavoriteLocation');

  return (
    <div className="bg-card border-border flex items-center gap-3 rounded-xl border px-3 py-2.5">
      <span className="bg-secondary text-accent flex size-9 shrink-0 items-center justify-center rounded-full">
        <MapPin className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-label text-muted-foreground block">
          {isPending ? t('picker.pickedLabel') : t('favorites.selectedHint')}
        </span>
        <span className="block truncate font-medium">{location.label}</span>
      </span>

      {canSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          title={t('favorites.saveToFavorites')}
          aria-label={t('favorites.saveToFavorites')}
          className={cn(
            'border-border-strong text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex size-9 shrink-0 items-center justify-center rounded-full border transition-all focus-visible:ring-3 focus-visible:outline-none',
            isSaving ? 'cursor-not-allowed opacity-60' : 'hover:border-accent hover:text-accent',
          )}
        >
          {isSaving ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <Star aria-hidden className="size-4" />
          )}
        </button>
      )}
    </div>
  );
}

function FavoritesList({
  favorites,
  isSelected,
  isPending,
  onPick,
  onDelete,
  deletingId,
  note,
}: Readonly<{
  favorites: readonly LocationSuggestion[];
  isSelected: (favorite: LocationSuggestion) => boolean;
  isPending: (favorite: LocationSuggestion) => boolean;
  onPick: (favorite: LocationSuggestion) => void;
  onDelete: (favorite: LocationSuggestion) => void;
  deletingId: string | null;
  note: string | null;
}>) {
  const t = useTranslations('FavoriteLocation');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="type-label text-muted-foreground">{t('favorites.heading')}</span>
        <span className="type-label text-muted-foreground">
          {t('favorites.counter', { count: favorites.length, max: MAX_FAVORITE_LOCATIONS })}
        </span>
      </div>

      {favorites.length === 0 ? (
        <p className="text-muted-foreground text-[11.5px] leading-snug">{t('favorites.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {favorites.map((favorite) => {
            const isDeleting = favorite.id === deletingId;

            return (
              <li
                key={favorite.id}
                className={cn(
                  'border-border hover:border-border-strong flex items-center rounded-[10px] border bg-clip-padding pr-1.5 transition-all',
                  isPending(favorite) && 'border-accent bg-accent/10 hover:border-accent',
                )}
              >
                <button
                  type="button"
                  aria-pressed={isPending(favorite)}
                  onClick={() => onPick(favorite)}
                  className="focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center gap-2.5 rounded-l-[9px] px-3 py-2.5 text-left focus-visible:ring-3 focus-visible:outline-none"
                >
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                    {favorite.label}
                  </span>
                  {isSelected(favorite) && (
                    <>
                      <Check aria-hidden className="text-accent size-4 shrink-0" />
                      <span className="sr-only">{t('favorites.selectedHint')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(favorite)}
                  disabled={isDeleting}
                  title={t('favorites.remove')}
                  aria-label={t('favorites.removeLabel', { location: favorite.label })}
                  className={cn(
                    'text-muted-foreground focus-visible:ring-ring/50 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-3 focus-visible:outline-none',
                    isDeleting ? 'cursor-not-allowed opacity-60' : 'hover:text-destructive',
                  )}
                >
                  {isDeleting ? (
                    <Loader2 aria-hidden className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 aria-hidden className="size-3.5" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {note && <p className="text-muted-foreground text-[11.5px] leading-snug">{note}</p>}
    </div>
  );
}
