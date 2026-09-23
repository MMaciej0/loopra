'use client';

import { useState, useTransition } from 'react';
import { MAX_FAVORITE_LOCATIONS } from '@loopra/domain';
import {
  deleteFavoriteLocation,
  saveFavoriteLocation,
  saveSelectedLocation,
} from '@/app/[locale]/(dashboard)/_actions/selected-location';
import type { LocationSuggestion } from '@/utils/geocoding';

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
  const [justSavedLabel, setJustSavedLabel] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [isApplying, startApplyTransition] = useTransition();
  const [isSavingFavorite, startSaveFavoriteTransition] = useTransition();
  const [deletingFavoriteId, setDeletingFavoriteId] = useState<string | null>(null);
  const [, startDeleteFavoriteTransition] = useTransition();

  const selectedLabel = selected?.label ?? null;
  const isFull = favorites.length >= MAX_FAVORITE_LOCATIONS;
  const shown = pending?.location ?? selected;
  const canSaveShown = shown !== null && !favorites.some((f) => f.label === shown.label);

  const clearSearch = () => setSearchKey((key) => key + 1);

  const reset = () => {
    setPending(null);
    setJustSavedLabel(null);
    setErrorKey(null);
    clearSearch();
  };

  const pickFromSearch = (location: LocationSuggestion | null) => {
    setErrorKey(null);

    if (!location) {
      if (pending?.source === 'search') setPending(null);
      return;
    }

    const saved = favorites.find((favorite) => favorite.label === location.label);

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

      setJustSavedLabel(location.label);
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
        setPending((current) => (current?.location.label === favorite.label ? null : current));
      } else {
        setErrorKey('favorites.deleteError');
      }

      setDeletingFavoriteId(null);
    });
  };

  const showRides = () => {
    if (!pending || pending.location.label === selectedLabel || isApplying) return;

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
    selectedLabel,
    searchKey,
    searchPick: pending?.source === 'search' ? pending.location : null,
    shown,
    isShownPending: pending !== null,
    canSaveShown,
    pendingLabel: pending?.location.label ?? justSavedLabel,
    canApply: pending !== null && pending.location.label !== selectedLabel,
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
