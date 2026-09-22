import { Type, type TSchema } from 'typebox';

const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const LocationProperties = {
  location: Type.Object({ x: Type.Number(), y: Type.Number() }, { additionalProperties: false }),
  city: Type.String(),
  district: Nullable(Type.String()),
  municipality: Nullable(Type.String()),
  region: Nullable(Type.String()),
  country: Type.String(),
  postal_code: Nullable(Type.String()),
};

export const SelectedLocationSchema = Type.Object(LocationProperties, {
  additionalProperties: false,
});

export const UpdateSelectedLocationResponseSchema = Type.Object(
  { selected_location: SelectedLocationSchema },
  { additionalProperties: false },
);
