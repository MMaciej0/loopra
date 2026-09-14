import { Type, type TSchema } from 'typebox';

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const CurrentUserSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    email: Type.String(),
    username: Nullable(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    email_verified: Type.Boolean(),
    favorite_location: Nullable(
      Type.Object({ x: Type.Number(), y: Type.Number() }, { additionalProperties: false }),
    ),
    favorite_city: Nullable(Type.String()),
    favorite_municipality: Nullable(Type.String()),
    favorite_region: Nullable(Type.String()),
    favorite_country: Nullable(Type.String()),
    favorite_postal_code: Nullable(Type.String()),
    favorite_location_chosen: Type.Boolean(),
    location_prompt_dismissed_at: Nullable(Type.String({ format: 'date-time' })),
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
