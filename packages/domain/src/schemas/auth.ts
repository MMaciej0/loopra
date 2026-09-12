import { Type } from 'typebox';

export const AuthUserSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    email: Type.String(),
    email_verified: Type.Boolean(),
    username: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const AuthUserResponseSchema = Type.Object(
  { user: AuthUserSchema },
  { additionalProperties: false },
);

export const SessionResponseSchema = Type.Object(
  { user: Type.Object({ id: Type.String({ format: 'uuid' }) }, { additionalProperties: false }) },
  { additionalProperties: false },
);

export const MessageResponseSchema = Type.Object(
  { message: Type.String() },
  { additionalProperties: false },
);
