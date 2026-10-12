import type { Availability, Phase } from './enums.js';

export function rideAvailability(participantCount: number, capacity: number): Availability {
  return participantCount >= capacity ? 'full' : 'open';
}

export function ridePhase(startTime: Date, now: Date): Phase {
  return startTime <= now ? 'past' : 'upcoming';
}
