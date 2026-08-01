import { KeyboardEvent, RefObject, useCallback } from 'react';

export function useRadioGroupKeyNavigation<T extends string>(
  groupRef: RefObject<HTMLDivElement | null>,
  selectableOptions: readonly T[],
  onSelect: (option: T) => void,
) {
  const focusRadio = useCallback(
    (index: number) => {
      const radios = groupRef?.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      radios?.[index]?.focus();
    },
    [groupRef],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = selectableOptions.length - 1;
      let next: number;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = index === last ? 0 : index + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = index === 0 ? last : index - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = last;
          break;
        default:
          return;
      }

      event.preventDefault();
      onSelect(selectableOptions[next]);
      focusRadio(next);
    },
    [onSelect, focusRadio, selectableOptions],
  );

  return { onKeyDown, focusRadio };
}
