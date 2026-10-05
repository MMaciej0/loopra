'use client';

import { createContext, useContext } from 'react';
import type { CurrentUser } from '@loopra/domain';

const CurrentUserContext = createContext<CurrentUser | null>(null);

type Props = Readonly<{
  user: CurrentUser | null;
  children: React.ReactNode;
}>;

export function CurrentUserProvider({ user, children }: Props) {
  return <CurrentUserContext value={user}>{children}</CurrentUserContext>;
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
