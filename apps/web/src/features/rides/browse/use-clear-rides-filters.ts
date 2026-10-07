import { useRouter } from '@/i18n/navigation';
import { NO_RIDES_FILTERS, ridesHref } from './filters';
import type { RidesView } from './view';

export function useClearRidesFilters(view: RidesView) {
  const router = useRouter();

  return () => router.replace(ridesHref(view, NO_RIDES_FILTERS));
}
