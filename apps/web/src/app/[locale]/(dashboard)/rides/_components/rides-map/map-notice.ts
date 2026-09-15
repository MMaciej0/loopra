import type { StartPointsStatus } from './use-start-points';

export type MapNotice = 'loading' | 'error' | 'empty' | 'out-of-view';

type MapNoticeInput = Readonly<{
  status: StartPointsStatus;
  startPointCount: number;
  hasStartPointInView: boolean | null;
}>;

export function mapNotice({
  status,
  startPointCount,
  hasStartPointInView,
}: MapNoticeInput): MapNotice | null {
  if (status !== 'done') return status;
  if (startPointCount === 0) return 'empty';
  if (hasStartPointInView === false) return 'out-of-view';
  return null;
}
