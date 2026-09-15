import type { StartPointGroup } from './start-points';

export function setMarkerSelected(element: HTMLElement, isSelected: boolean) {
  element.setAttribute('aria-pressed', String(isSelected));
  element.style.zIndex = isSelected ? '1' : '';
}

export function createMarkerElement({ rides }: StartPointGroup, label: string) {
  const rideCount = rides.length;
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', 'false');
  button.className =
    'group focus-visible:ring-ring/50 grid size-8 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-3';

  const pin = document.createElement('span');
  pin.className =
    'bg-accent border-background group-aria-pressed:bg-foreground relative grid size-8 place-items-center rounded-full border-2 shadow-md transition-[scale,background-color] group-aria-pressed:scale-125';
  button.appendChild(pin);

  const dot = document.createElement('span');
  dot.className = 'bg-accent-foreground group-aria-pressed:bg-accent size-2.5 rounded-full';
  pin.appendChild(dot);

  if (rideCount > 1) {
    const badge = document.createElement('span');
    badge.setAttribute('aria-hidden', 'true');
    badge.className =
      'bg-foreground text-background absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-semibold';
    badge.textContent = String(rideCount);
    pin.appendChild(badge);
  }

  return button;
}
