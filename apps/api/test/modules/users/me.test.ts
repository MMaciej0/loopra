import { describe, expect, it } from 'vitest';
import { useApp, registerUser } from '../../helpers/app.js';

describe('GET /users/me', () => {
  const appRef = useApp();

  it('returns 401 when not authenticated', async () => {
    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 404 when user has a valid token but account no longer exists', async () => {
    const ghostToken = appRef.app.jwt.sign({ sub: '00000000-0000-0000-0000-000000000000' });

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken: ghostToken },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ type: 'USER_NOT_FOUND' });
  });

  it('returns current user profile when authenticated', async () => {
    const { accessToken, userId, email } = await registerUser(appRef.app);

    const response = await appRef.app.inject({
      method: 'GET',
      url: '/users/me',
      cookies: { accessToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { id: userId, email },
    });
  });
});
