'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLocale } from 'next-intl';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { forwardGeocode, type LocationSuggestion } from '@/utils/geocoding';

export function LocationPicker({
  value: selectedLocation,
  onSelect,
  portalContainer,
}: {
  value: LocationSuggestion | null;
  onSelect: (location: LocationSuggestion | null) => void;
  portalContainer: RefObject<HTMLDivElement | null>;
}) {
  const locale = useLocale();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cache = useRef(new Map<string, LocationSuggestion[]>());

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) return;

    const cacheKey = `${locale}:${query}`;
    const cached = cache.current.get(cacheKey);

    if (cached) {
      setSuggestions(cached);
      setIsSearching(false);
      setHasError(false);
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setHasError(false);

      try {
        const nextSuggestions = await forwardGeocode(query, locale);
        if (cancelled) return;

        cache.current.set(cacheKey, nextSuggestions);
        setSuggestions(nextSuggestions);
      } catch {
        if (cancelled) return;

        setSuggestions([]);
        setHasError(true);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [inputValue, locale]);

  const items =
    selectedLocation && !suggestions.some((item) => item.id === selectedLocation.id)
      ? [selectedLocation, ...suggestions]
      : suggestions;

  const selectLocation = (location: LocationSuggestion | null) => {
    onSelect(location);

    if (location) {
      setInputValue(location.label);
    }
  };

  return (
    <Combobox<LocationSuggestion>
      items={items}
      filteredItems={suggestions}
      filter={null}
      inputValue={inputValue}
      value={selectedLocation}
      autoHighlight
      itemToStringLabel={(location) => location.label}
      itemToStringValue={(location) => location.id}
      isItemEqualToValue={(item, value) => item.id === value.id}
      onInputValueChange={(value, details) => {
        if (details.reason !== 'input-change') return;

        setInputValue(value);
        if (!value.trim()) {
          setSuggestions([]);
          setIsSearching(false);
          setHasError(false);
        }
        selectLocation(null);
      }}
      onValueChange={selectLocation}
    >
      <ComboboxInput
        aria-label="Search for a city or area"
        placeholder="Search for a city or area"
        showTrigger={false}
      />
      <ComboboxContent portalContainer={portalContainer} aria-busy={isSearching || undefined}>
        <ComboboxEmpty>
          {isSearching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Searching locations...
            </span>
          ) : hasError ? (
            'Could not load locations. Try again.'
          ) : inputValue.trim() ? (
            'No locations found.'
          ) : (
            'Start typing to search for a location.'
          )}
        </ComboboxEmpty>
        <ComboboxList>
          {(location: LocationSuggestion) => (
            <ComboboxItem
              key={location.id}
              value={location}
              onClick={() => selectLocation(location)}
            >
              <span className="min-w-0">
                <span className="block truncate">{location.label}</span>
                {(location.city || location.country) && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {[location.city, location.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
