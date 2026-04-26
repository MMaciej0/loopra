import { describe, expect, it } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { useAuthenticatedUser } from '../../helpers/auth.js';

describe('GET /users/:id', () => {
  const appRef = useApp();
  const auth = useAuthenticatedUser(appRef);

  it('returns 401 when not authenticated', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: `/users/00000000-0000-0000-0000-000000000000`,
    });

    expect(response.statusCode).toBe(401);
  });

  it("returns 404 when user doesn't exist", async () => {
    const ghostToken = appRef.app.jwt.sign({ sub: '00000000-0000-0000-0000-000000000000' });

    const response = await appRef.app.inject({
      method: 'GET',
      url: `/users/00000000-0000-0000-0000-000000000000`,
      cookies: { accessToken: ghostToken },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: 'USER_NOT_FOUND' });
  });

  it('returns user data when user exists and authenticated', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: `/users/${auth.userId}`,
      cookies: { accessToken: auth.accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.email).toBe(auth.email);
  });
});
