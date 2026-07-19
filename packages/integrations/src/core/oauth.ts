/**
 * Reusable OAuth 2.0 Authorization Code client (with optional PKCE). Calendar,
 * video, CRM and messaging providers that authenticate via OAuth delegate the
 * authorize-URL construction and token exchange/refresh to this helper.
 */

import { createHash, randomBytes } from 'node:crypto';

import { IntegrationError, IntegrationErrorKind } from './errors';
import { HttpClient } from './http';

export interface OAuth2ProviderConfig {
  readonly authorizeUrl: string;
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
  /** Extra static params appended to the authorize URL (e.g. access_type). */
  readonly authorizeParams?: Record<string, string>;
  /** Send client credentials in the Authorization header rather than the body. */
  readonly useBasicAuth?: boolean;
  /** Enable PKCE (S256). Recommended for public clients. */
  readonly usePkce?: boolean;
  readonly scopeSeparator?: string;
}

export interface OAuth2Tokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType?: string;
  readonly scope?: string;
  /** Absolute expiry (ms epoch), derived from `expires_in` when present. */
  readonly expiresAt?: number;
  readonly raw: Record<string, unknown>;
}

export interface AuthorizeUrlResult {
  readonly url: string;
  readonly state: string;
  /** Present when PKCE is enabled; persist alongside state for the callback. */
  readonly codeVerifier?: string;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

function base64Url(buf: Buffer): string {
  return buf.toString('base64url');
}

export class OAuth2Client {
  private readonly http: HttpClient;

  constructor(
    private readonly config: OAuth2ProviderConfig,
    http?: HttpClient,
  ) {
    this.http = http ?? new HttpClient();
  }

  /**
   * Build the provider authorize URL. Returns the URL plus the generated
   * `state` (CSRF) and, when PKCE is enabled, the `codeVerifier` to persist.
   */
  buildAuthorizeUrl(extra?: Record<string, string>): AuthorizeUrlResult {
    const state = base64Url(randomBytes(24));
    const separator = this.config.scopeSeparator ?? ' ';
    const url = new URL(this.config.authorizeUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', this.config.redirectUri);
    url.searchParams.set('scope', this.config.scopes.join(separator));
    url.searchParams.set('state', state);
    for (const [k, v] of Object.entries(this.config.authorizeParams ?? {})) {
      url.searchParams.set(k, v);
    }
    for (const [k, v] of Object.entries(extra ?? {})) {
      url.searchParams.set(k, v);
    }

    let codeVerifier: string | undefined;
    if (this.config.usePkce) {
      codeVerifier = base64Url(randomBytes(32));
      const challenge = base64Url(createHash('sha256').update(codeVerifier).digest());
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }

    return { url: url.toString(), state, ...(codeVerifier ? { codeVerifier } : {}) };
  }

  /** Exchange an authorization `code` for tokens. */
  async exchangeCode(code: string, codeVerifier?: string): Promise<OAuth2Tokens> {
    const form: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
    };
    if (codeVerifier) form['code_verifier'] = codeVerifier;
    return this.tokenRequest(form);
  }

  /** Use a refresh token to obtain a fresh access token. */
  async refresh(refreshToken: string): Promise<OAuth2Tokens> {
    const tokens = await this.tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    // Some providers omit the refresh_token on refresh; keep the old one.
    return tokens.refreshToken ? tokens : { ...tokens, refreshToken };
  }

  private async tokenRequest(form: Record<string, string>): Promise<OAuth2Tokens> {
    const headers: Record<string, string> = {};
    const body: Record<string, string> = { ...form };

    if (this.config.useBasicAuth && this.config.clientSecret) {
      const basic = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else {
      body['client_id'] = this.config.clientId;
      if (this.config.clientSecret) body['client_secret'] = this.config.clientSecret;
    }

    const { data } = await this.http.post<TokenResponse>(this.config.tokenUrl, {
      form: body,
      headers,
      retry: { maxAttempts: 3 },
    });

    if (data.error || !data.access_token) {
      throw new IntegrationError(
        `OAuth token exchange failed: ${data.error_description ?? data.error ?? 'no access_token'}`,
        { kind: IntegrationErrorKind.Auth },
      );
    }

    return {
      accessToken: data.access_token,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      ...(data.token_type ? { tokenType: data.token_type } : {}),
      ...(data.scope ? { scope: data.scope } : {}),
      ...(data.expires_in
        ? { expiresAt: Date.now() + data.expires_in * 1000 }
        : {}),
      raw: data as Record<string, unknown>,
    };
  }
}
