import { HOST } from '@/utils/api-routes';

const R2_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;

export function resolveMediaUrl(messagePath) {
  if (!messagePath) return '';

  if (typeof messagePath === 'string' && /^https?:\/\//i.test(messagePath)) {
    return messagePath;
  }

  if (R2_PUBLIC_BASE_URL) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${String(messagePath).replace(/^\//, '')}`;
  }

  return `${HOST}/${messagePath}`;
}
