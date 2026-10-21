'use client';

import type { ComponentProps, MouseEvent } from 'react';
import { Link } from '@/i18n/navigation';

type SectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  sectionId: string;
};

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return false;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  return true;
}

export function SectionLink({ sectionId, onClick, ...props }: SectionLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (!scrollToSection(sectionId)) return;

    event.preventDefault();
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  return <Link href={`/#${sectionId}`} onClick={handleClick} {...props} />;
}
