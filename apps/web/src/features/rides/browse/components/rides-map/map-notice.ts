import type { StartPointsStatus } from './use-start-points';

export type MapNotice =
  'loading' | 'error' | 'empty' | 'empty-filtered' | 'out-of-view' | 'truncated';

type MapNoticeInput = Readonly<{
  status: StartPointsStatus;
  startPointCount: number;
  hasStartPointInView: boolean | null;
  truncated: boolean;
  hasActiveFilters: boolean;
}>;

export function mapNotice({
  status,
  startPointCount,
  hasStartPointInView,
  truncated,
  hasActiveFilters,
}: MapNoticeInput): MapNotice | null {
  if (status !== 'done') return status;
  if (startPointCount === 0) return hasActiveFilters ? 'empty-filtered' : 'empty';
  if (hasStartPointInView === false) return 'out-of-view';
  if (truncated) return 'truncated';
  return null;
}
