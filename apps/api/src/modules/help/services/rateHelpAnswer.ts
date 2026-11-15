import { help_answers } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { HelpFeedbackBody, HelpFeedbackResponse } from '@loopra/domain';
import type { Db } from '../../../db/index.js';
import { HelpAnswerNotFoundError } from '../errors.js';

export const rateHelpAnswer = async (
  db: Db,
  id: string,
  rating: HelpFeedbackBody['rating'],
): Promise<HelpFeedbackResponse> => {
  const [answer] = await db
    .update(help_answers)
    .set({ rating })
    .where(eq(help_answers.id, id))
    .returning({ rating: help_answers.rating });

  if (!answer) {
    throw new HelpAnswerNotFoundError();
  }

  return answer;
};
