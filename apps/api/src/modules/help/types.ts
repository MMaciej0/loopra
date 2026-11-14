import { help_answers } from '../../db/schema.js';

export type NewHelpAnswer = typeof help_answers.$inferInsert;
