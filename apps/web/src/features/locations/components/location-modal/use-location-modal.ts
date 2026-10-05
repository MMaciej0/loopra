'use client';

import { useState, useTransition } from 'react';
import { isSamePlace, MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import {
  deleteFavoriteLocation,
  saveFavoriteLocation,
  saveSelectedLocation,
} from '@/features/locations/actions/selected-location';
import type { LocationSuggestion } from '@/features/locations/geocoding';

type PendingPick = Readonly<{
  location: LocationSuggestion;
  source: 'search' | 'favorite';
}>;

type ErrorKey =
  | 'saveError'
  | 'favorites.saveError'
  | 'favorites.deleteError'
  | 'firstRun.defaultError';

type Options = Readonly<{
  favorites: readonly LocationSuggestion[];
  selected: LocationSuggestion | null;
  onApplied: () => void;
}>;

export type LocationModal = ReturnType<typeof useLocationModal>;

export function useLocationModal({ favorites, selected, onApplied }: Options) {
  const [pending, setPending] = useState<PendingPick | null>(null);
  const [searchKey, setSearchKey] = useState(0);
  const [justSaved, setJustSaved] = useState<LocationSuggestion | null>(null);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [isApplying, startApplyTransition] = useTransition();
  const [isSavingFavorite, startSaveFavoriteTransition] = useTransition();
  const [deletingFavoriteId, setDeletingFavoriteId] = useState<string | null>(null);
  const [, startDeleteFavoriteTransition] = useTransition();

  const isSelected = (location: LocationSuggestion) =>
    selected !== null && isSamePlace(location.coords, selected.coords);
  const isPending = (location: LocationSuggestion) => {
    const marked = pending?.location ?? justSaved;

    return marked !== null && isSamePlace(location.coords, marked.coords);
  };
  const isFull = favorites.length >= MAX_FAVORITE_LOCATIONS;
  const shown = pending?.location ?? selected;
  const canSaveShown =
    shown !== null && !favorites.some((f) => isSamePlace(f.coords, shown.coords));

  const clearSearch = () => setSearchKey((key) => key + 1);

  const reset = () => {
    setPending(null);
    setJustSaved(null);
    setErrorKey(null);
    clearSearch();
  };

  const pickFromSearch = (location: LocationSuggestion | null) => {
    setErrorKey(null);

    if (!location) {
      if (pending?.source === 'search') setPending(null);
      return;
    }

    const saved = favorites.find((favorite) => isSamePlace(favorite.coords, location.coords));

    if (saved) {
      setPending({ location: saved, source: 'favorite' });
      clearSearch();
      return;
    }

    setPending({ location, source: 'search' });
  };

  const pickFavorite = (favorite: LocationSuggestion) => {
    setErrorKey(null);
    setPending({ location: favorite, source: 'favorite' });
    clearSearch();
  };

  const saveShownAsFavorite = () => {
    if (!shown || !canSaveShown || isFull || isSavingFavorite) return;

    const location = shown;

    setErrorKey(null);
    startSaveFavoriteTransition(async () => {
      const result = await saveFavoriteLocation(location);

      if (!result.ok) {
        setErrorKey('favorites.saveError');
        return;
      }

      setJustSaved(location);
      setPending((current) => (current ? { location, source: 'favorite' } : null));
      clearSearch();
    });
  };

  const deleteFavorite = (favorite: LocationSuggestion) => {
    if (deletingFavoriteId) return;

    setErrorKey(null);
    setDeletingFavoriteId(favorite.id);
    startDeleteFavoriteTransition(async () => {
      const result = await deleteFavoriteLocation(favorite.id);

      if (result.ok) {
        setPending((current) =>
          current && isSamePlace(current.location.coords, favorite.coords) ? null : current,
        );
      } else {
        setErrorKey('favorites.deleteError');
      }

      setDeletingFavoriteId(null);
    });
  };

  const showRides = () => {
    if (!pending || isSelected(pending.location) || isApplying) return;

    setErrorKey(null);
    startApplyTransition(async () => {
      const result = await saveSelectedLocation(pending.location);

      if (result.ok) {
        onApplied();
      } else {
        setErrorKey('saveError');
      }
    });
  };

  return {
    favorites,
    isSelected,
    isPending,
    searchKey,
    searchPick: pending?.source === 'search' ? pending.location : null,
    shown,
    isShownPending: pending !== null,
    canSaveShown,
    canApply: pending !== null && !isSelected(pending.location),
    isFull,
    errorKey,
    setErrorKey,
    isApplying,
    isSavingFavorite,
    deletingFavoriteId,
    pickFromSearch,
    pickFavorite,
    saveShownAsFavorite,
    deleteFavorite,
    showRides,
    reset,
  };
}
