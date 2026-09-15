import { getPayload } from 'payload';
import config from '@payload-config';

let cached = (global as any).payload;

if (!cached) {
  cached = (global as any).payload = { client: null, promise: null };
}

/**
 * Returns the Payload instance for server-side use as a singleton.
 * Prevents opening excessive database connections during development and SSR.
 */
export async function getPayloadClient() {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = getPayload({ config });
  }

  try {
    cached.client = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
}
