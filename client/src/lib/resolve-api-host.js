export function resolveApiHost() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
}
