export class EventNotFoundError extends Error {}
export class EventUpdateBadBodyError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'EventUpdateBadBodyError';
  }
}
export class EventHasParticipantsError extends Error {}
