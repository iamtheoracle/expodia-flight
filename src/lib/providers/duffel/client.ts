import { ProviderError } from '@/lib/providers/errors';

const DEFAULT_BASE_URL = 'https://api.duffel.com';
const DUFFEL_VERSION = 'v2';

export class DuffelClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = options?.apiKey ?? process.env.DUFFEL_API_KEY ?? '';
    this.baseUrl = (options?.baseUrl ?? process.env.DUFFEL_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');

    if (!this.apiKey) {
      throw new ProviderError('DUFFEL_NOT_CONFIGURED', 'Duffel API access token is not configured.');
    }
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 130_000);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Duffel-Version': DUFFEL_VERSION,
          Authorization: `Bearer ${this.apiKey}`,
          ...(init.headers ?? {}),
        },
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const code = body?.errors?.[0]?.code ?? body?.error?.code ?? `HTTP_${response.status}`;
        const message = body?.errors?.[0]?.message ?? body?.error?.message ?? 'Duffel API request failed.';
        throw new ProviderError(`DUFFEL_${code.toUpperCase()}`, message);
      }

      return body as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
