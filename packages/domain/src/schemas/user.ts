import { Type, type TSchema } from 'typebox';

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const CurrentUserSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    email: Type.String(),
    username: Nullable(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    email_verified: Type.Boolean(),
    favorite_location: Type.Object(
      { x: Type.Number(), y: Type.Number() },
      { additionalProperties: false },
    ),
    favorite_city: Type.String(),
    favorite_municipality: Nullable(Type.String()),
    favorite_region: Nullable(Type.String()),
    favorite_country: Type.String(),
    favorite_postal_code: Nullable(Type.String()),
    favorite_location_chosen: Type.Boolean(),
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
