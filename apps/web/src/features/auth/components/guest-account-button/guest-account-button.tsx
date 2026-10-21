import { connection } from 'next/server';
import { getAppEnv } from '@/lib/app-env';
import { GuestAccountForm } from './guest-account-form';

export async function GuestAccountButton() {
  await connection();

  if (getAppEnv() !== 'staging') return null;

  return <GuestAccountForm />;
}
