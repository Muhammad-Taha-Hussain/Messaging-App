// src/core/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Move keys into the Client-Accessible block
  NEXT_PUBLIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_APP_ID: z.string().min(1),
  NEXT_PUBLIC_MEASUREMENT_ID: z.string().min(1),
});

const validateEnv = () => {
  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    NEXT_PUBLIC_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    NEXT_PUBLIC_MEASUREMENT_ID: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  });

  if (!result.success) {
    console.error('❌ Environment Variable Configuration Validation Failed:');
    const formattedErrors = result.error.format();
    Object.entries(formattedErrors).forEach(([key, value]) => {
      if (key !== '_errors' && value && typeof value === 'object' && '_errors' in value) {
        const fieldErrors = (value as { _errors?: string[] })._errors;
        console.error(`👉 [${key}]: ${fieldErrors?.join(', ') ?? 'Unknown error'}`);
      }
    });

    if (typeof window === 'undefined') {
      process.exit(1);
    }
  }

  return result.data!;
};

export const env = validateEnv();