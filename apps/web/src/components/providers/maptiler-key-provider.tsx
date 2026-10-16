'use client';

import { createContext, useContext } from 'react';

const MaptilerKeyContext = createContext<string | undefined>(undefined);

type Props = Readonly<{
  apiKey: string | undefined;
  children: React.ReactNode;
}>;

export function MaptilerKeyProvider({ apiKey, children }: Props) {
  return <MaptilerKeyContext value={apiKey}>{children}</MaptilerKeyContext>;
}

export function useMaptilerKey() {
  const apiKey = useContext(MaptilerKeyContext);

  if (!apiKey) {
    throw new Error('MAPTILER_KEY is not set');
  }

  return apiKey;
}
