import { z } from 'zod';

export const RIDES_VIEWS = ['map', 'list'] as const;

export type RidesView = (typeof RIDES_VIEWS)[number];

const DEFAULT_RIDES_VIEW: RidesView = 'map';

export type RidesViewParams = Readonly<{ view?: string | string[] }>;

export type ResolvedRidesView = Readonly<{
  view: RidesView;
  shouldRedirect: boolean;
}>;

const viewSchema = z.enum(RIDES_VIEWS);

export function resolveRidesView(searchParams: RidesViewParams): ResolvedRidesView {
  const parsed = viewSchema.safeParse(searchParams.view);

  return parsed.success
    ? { view: parsed.data, shouldRedirect: false }
    : { view: DEFAULT_RIDES_VIEW, shouldRedirect: true };
}
