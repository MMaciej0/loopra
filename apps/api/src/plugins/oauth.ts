import fastifyPlugin from 'fastify-plugin';
import oauthPlugin from '@fastify/oauth2';
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/env.js';

export default fastifyPlugin(async (fastify) => {
  fastify.register(oauthPlugin, {
    name: 'oauth2Google',
    scope: ['openid', 'email', 'profile'],
    credentials: {
      client: {
        id: GOOGLE_CLIENT_ID,
        secret: GOOGLE_CLIENT_SECRET,
      },
    },
    discovery: { issuer: 'https://accounts.google.com' },
    startRedirectPath: '/auth/google',
    callbackUri: GOOGLE_CALLBACK_URL,
  });
});
