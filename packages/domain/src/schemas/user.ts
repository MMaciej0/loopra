import { Type, type TSchema } from 'typebox';
import { SelectedLocationSchema } from './location.js';

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const CurrentUserSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    email: Type.String(),
    username: Nullable(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    email_verified: Type.Boolean(),
    selected_location: Nullable(SelectedLocationSchema),
  },
  { additionalProperties: false },
);

export const GetCurrentUserResponseSchema = Type.Object(
  { user: CurrentUserSchema },
  { additionalProperties: false },
);

export const UpdateCurrentUserResponseSchema = Type.Object(
  { updatedUser: CurrentUserSchema },
  { additionalProperties: false },
);
