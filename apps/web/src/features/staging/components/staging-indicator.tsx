import { connection } from 'next/server';
import { getAppEnv } from '@/lib/app-env';
import { StagingIndicatorPopover } from './staging-indicator-popover';

export async function StagingIndicator() {
  await connection();

  if (getAppEnv() !== 'staging') return null;

  return <StagingIndicatorPopover />;
}
