const STEPS_KM = [1, 2, 5, 10, 20, 25, 50, 100];
const MIN_TICKS = 4;
const MAX_TICKS = 6;

function tickCount(distanceKm: number, stepKm: number) {
  return Math.floor(distanceKm / stepKm) + 1;
}

function pickStep(distanceKm: number) {
  const fitting = STEPS_KM.find((step) => {
    const count = tickCount(distanceKm, step);

    return count >= MIN_TICKS && count <= MAX_TICKS;
  });

  return (
    fitting ??
    STEPS_KM.find((step) => tickCount(distanceKm, step) <= MAX_TICKS) ??
    STEPS_KM[STEPS_KM.length - 1]
  );
}

export function distanceTicks(distanceKm: number): number[] {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return [];

  const step = pickStep(distanceKm);

  return Array.from({ length: tickCount(distanceKm, step) }, (_, index) => index * step);
}
