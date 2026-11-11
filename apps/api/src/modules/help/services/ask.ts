import { systemBlocks } from '../systemPrompt.js';
import type Anthropic from '@anthropic-ai/sdk';
import type { HelpMessageBody } from '@loopra/domain';

export const askHelp = async (anthropic: Anthropic, body: HelpMessageBody) => {
  const answer = await anthropic.messages.create({
    model: 'claude-haiku-5-5',
    output_config: { effort: 'low' },
    max_tokens: 1024,
    system: systemBlocks,
    messages: [{ role: 'user', content: `Locale: ${body.locale}\n\nQuestion: ${body.question}` }],
  });

  const answerText = answer.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return { answer: answerText, usage: answer.usage };
};
