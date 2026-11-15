import type { Db } from '../../../db/index.js';
import { help_answers } from '../../../db/schema.js';
import type { NewHelpAnswer } from '../types.js';

export const createHelpAnswer = async (db: Db, newAnswer: NewHelpAnswer): Promise<string> => {
  const [{ id }] = await db
    .insert(help_answers)
    .values(newAnswer)
    .returning({ id: help_answers.id });

  return id;
};
