'use client';

import { createAuthClient } from 'better-auth/react';

import { env } from './env';

/**
 * Better Auth browser client. Points at the API's mounted auth handler.
 * Exposes hooks (`useSession`) and methods (`signIn`, `signUp`, `signOut`).
 */
export const authClient = createAuthClient({
  baseURL: `${env.apiUrl}/api/auth`,
});

export const { signIn, signUp, signOut, useSession } = authClient;
