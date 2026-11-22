import type { TokenPair } from './types';

const REFRESH_KEY = 'iskool.refreshToken';
const KIND_KEY = 'iskool.sessionKind';
const YEAR_KEY = 'iskool.academicYearId';

/** `institute` = a school/college user; `platform` = the iSkool owner's super-admin console. */
export type SessionKind = 'institute' | 'platform';

type Listener = () => void;

/**
 * Token storage. The access token lives only in memory; the refresh token is persisted so a reload
 * keeps the user signed in. Listeners are notified when the session ends (logout or failed refresh).
 */
class SessionStore {
  private accessToken: string | null = null;
  private readonly listeners = new Set<Listener>();

  get access(): string | null {
    return this.accessToken;
  }

  get refresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  get kind(): SessionKind {
    return localStorage.getItem(KIND_KEY) === 'platform' ? 'platform' : 'institute';
  }

  get hasSession(): boolean {
    return Boolean(this.accessToken || this.refresh);
  }

  save(tokens: TokenPair, kind: SessionKind = this.kind): void {
    this.accessToken = tokens.accessToken;
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(KIND_KEY, kind);
  }

  clear(): void {
    const hadSession = this.hasSession;
    this.accessToken = null;
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(KIND_KEY);
    localStorage.removeItem(YEAR_KEY);
    if (hadSession) this.listeners.forEach((listener) => listener());
  }

  onEnd(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get academicYearId(): string | null {
    return localStorage.getItem(YEAR_KEY);
  }

  set academicYearId(id: string | null) {
    if (id) localStorage.setItem(YEAR_KEY, id);
    else localStorage.removeItem(YEAR_KEY);
  }
}

export const session = new SessionStore();
