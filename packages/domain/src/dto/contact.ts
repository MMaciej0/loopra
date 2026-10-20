import type { z } from 'zod';
import type { ContactMessageBodySchema } from '../schemas/contact.js';

export type ContactMessageBody = z.output<typeof ContactMessageBodySchema>;
