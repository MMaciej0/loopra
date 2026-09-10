export interface CurrentUser {
  id: string;
  email: string;
  created_at: string;
  email_verified: boolean;
  favorite_location: { x: number; y: number } | null;
  favorite_city: string | null;
  favorite_municipality: string | null;
  favorite_region: string | null;
  favorite_country: string | null;
  favorite_postal_code: string | null;
  location_prompt_dismissed_at: string | null;
}

export interface GetCurrentUserResponse {
  user: CurrentUser;
}
