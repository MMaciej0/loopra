import type { StartPointsStatus } from './use-start-points';

export type MapNotice = 'loading' | 'error' | 'empty' | 'out-of-view' | 'truncated';

type MapNoticeInput = Readonly<{
  status: StartPointsStatus;
  startPointCount: number;
  hasStartPointInView: boolean | null;
  truncated: boolean;
}>;

export function mapNotice({
  status,
  startPointCount,
  hasStartPointInView,
  truncated,
}: MapNoticeInput): MapNotice | null {
  if (status !== 'done') return status;
  if (startPointCount === 0) return 'empty';
  if (hasStartPointInView === false) return 'out-of-view';
  if (truncated) return 'truncated';
  return null;
}
