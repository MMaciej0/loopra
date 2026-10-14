'use client';

import { useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { LoaderCircle, Route, Upload, X } from 'lucide-react';
import { ElevationBanner } from '@/features/rides/components/ride-card/elevation-banner';
import { buildElevationPaths } from '@/features/rides/components/ride-card/geometry';
import { Button } from '@/components/ui/button';
import { InputLabel } from '@/components/ui/input-label';
import { Text } from '@/components/ui/text';
import { MAX_GPX_FILE_SIZE_BYTES, MAX_GPX_FILE_SIZE_MB } from '@loopra/domain';
import { APP_ERROR_TYPES, isAppErrorType, type AppErrorType } from '@loopra/domain';
import { cn } from '@/lib/utils';
import type { CreateRideInput } from '@/features/rides/create/schema';

export function RouteInput() {
  const t = useTranslations('CreateRide');
  const tErrors = useTranslations('Errors');
  const { control, setValue } = useFormContext<CreateRideInput>();
  const inputRef = useRef<HTMLInputElement>(null);

  const route = useWatch({ control, name: 'route' });
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<AppErrorType | null>(null);

  const upload = async (file: File) => {
    if (pending) return;

    setError(null);

    if (file.size > MAX_GPX_FILE_SIZE_BYTES) {
      setError(APP_ERROR_TYPES.FILE_TOO_LARGE);
      return;
    }

    setPending(true);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/routes', { method: 'POST', body });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        setError(isAppErrorType(payload.type) ? payload.type : APP_ERROR_TYPES.UNKNOWN);
        return;
      }

      setValue('route', payload.data, { shouldDirty: true });
      setValue('distance_km', Number(payload.data.distance_km), { shouldDirty: true });
    } catch {
      setError(APP_ERROR_TYPES.UNKNOWN);
    } finally {
      setPending(false);
    }
  };

  const onRemove = () => {
    setError(null);
    setValue('route', undefined, { shouldDirty: true });
    setValue('distance_km', undefined, { shouldDirty: true });
  };

  const profilePaths = route
    ? buildElevationPaths(route.elevation_profile, Number(route.distance_km))
    : [];

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        id="route"
        type="file"
        tabIndex={-1}
        accept=".gpx,application/gpx+xml"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) void upload(file);
        }}
      />

      <div className="flex flex-col gap-y-1.5">
        <InputLabel id="route" className="flex items-center">
          <span className="inline-flex pr-2">
            <Route className="size-2.5" />
          </span>
          {t('routeLabel')}
        </InputLabel>

        {route ? (
          <div className="border-accent bg-accent/10 flex h-56 flex-col gap-y-3 rounded-[10px] border p-4">
            <div className="flex items-start gap-x-2">
              <Route aria-hidden className="text-accent mt-0.5 size-4 shrink-0" />
              <Text variant="body-s" className="min-w-0 flex-1 truncate">
                {route.name}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                loading={pending}
                onClick={() => inputRef.current?.click()}
                aria-label={t('routeReplace')}
                className="text-muted-foreground hover:text-accent -mt-1 shrink-0"
              >
                <Upload />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={onRemove}
                aria-label={t('routeRemove')}
                className="text-muted-foreground hover:text-destructive -mt-1 -mr-1.5 shrink-0"
              >
                <X />
              </Button>
            </div>

            <div className="min-h-0 flex-1">
              {profilePaths.length > 0 && <ElevationBanner paths={profilePaths} />}
            </div>

            <div className="grid grid-cols-3 gap-x-3">
              {[
                {
                  label: t('routeDistanceLabel'),
                  value: t('routeKm', { value: Number(route.distance_km).toFixed(1) }),
                },
                {
                  label: t('routeAscentLabel'),
                  value: t('routeM', { value: Math.round(Number(route.ascent_m)) }),
                },
                {
                  label: t('routeDescentLabel'),
                  value: t('routeM', { value: Math.round(Number(route.descent_m)) }),
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-y-1">
                  <Text variant="stat">{stat.value}</Text>
                  <Text variant="label" className="text-muted-foreground">
                    {stat.label}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setDragging(false);
            }}
            onDrop={onDrop}
            className={cn(
              'flex h-56 cursor-pointer flex-col items-center justify-center gap-y-2 rounded-[10px] border border-dashed px-3 py-4 transition-colors',
              dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent',
              pending && 'cursor-default opacity-60',
            )}
          >
            {pending ? (
              <LoaderCircle className="text-muted-foreground size-6 animate-spin" />
            ) : (
              <Upload className="text-muted-foreground size-6" />
            )}
            <Text variant="body-s">{pending ? t('routeUploading') : t('routeDropzone')}</Text>
            {!pending && (
              <Text variant="body-xs" className="text-muted-foreground">
                {t('routeLimit', { maxSizeMb: MAX_GPX_FILE_SIZE_MB })}
              </Text>
            )}
          </button>
        )}

        {error && (
          <Text role="alert" variant="body-xs" className="text-destructive">
            {tErrors(error, { maxSizeMb: MAX_GPX_FILE_SIZE_MB })}
          </Text>
        )}
      </div>
    </>
  );
}
