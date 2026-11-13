import { systemBlocks } from '../systemPrompt.js';
import { reportAnswerTool } from '../tools.js';
import type Anthropic from '@anthropic-ai/sdk';
import type { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream';
import type { HelpMessageBody } from '@loopra/domain';

export const askHelp = (anthropic: Anthropic, body: HelpMessageBody): MessageStream => {
  return anthropic.messages.stream({
    model: 'claude-haiku-5-5',
    output_config: { effort: 'low' },
    max_tokens: 1024,
    system: systemBlocks,
    tools: [reportAnswerTool],
    messages: [{ role: 'user', content: `Locale: ${body.locale}\n\nQuestion: ${body.question}` }],
  });
};
