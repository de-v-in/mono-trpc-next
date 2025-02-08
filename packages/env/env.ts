import { z } from 'zod';

const ENVBackendSchema = z.object({
  BE_SAME_DOMAIN: z.boolean().optional().default(false),
  BACKEND_URL: z.string().optional().default('http://localhost:3001'),
  BACKEND_URL_INTERNAL: z.string().optional().default('http://localhost:3001'),
  NEXTAUTH_SECRET: z.string().optional().default('secret'),
  INTERNAL_SECRET: z.string().optional().default('internal-secret'),
  IS_DEV: z.boolean().optional().default(true),
});

export const BackendENV = ENVBackendSchema.parse({
  BE_SAME_DOMAIN: process.env.BE_SAME_DOMAIN === 'true',
  BACKEND_URL: process.env.BACKEND_URL,
  BACKEND_URL_INTERNAL: process.env.BACKEND_URL_INTERNAL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  INTERNAL_SECRET: process.env.INTERNAL_SECRET,
  IS_DEV: process.env.NODE_ENV === 'development',
});
