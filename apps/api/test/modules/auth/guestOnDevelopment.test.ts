import { describe, it, expect } from 'vitest';
import { useApp } from '../../helpers/app.js';
import { users } from '../../../src/db/schema.js';

describe('POST /auth/guest on development', () => {
  const appRef = useApp({ appEnv: 'development' });

  it('returns 404 and creates no user', async () => {
    const response = await appRef.app.inject({ method: 'POST', url: '/auth/guest' });

    expect(response.statusCode).toBe(404);
    expect(await appRef.app.db.select().from(users)).toHaveLength(0);
  });
});
