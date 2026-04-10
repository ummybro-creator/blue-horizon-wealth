// Custom API client — drop-in replacement for @supabase/supabase-js
// Talks to our Express backend instead of Supabase

// URL resolution (evaluated once at startup in the browser):
//   • VITE_API_URL env var (set at Vite build time) — highest priority
//   • Replit dev / production hostnames → /api  (Express is on the same server)
//   • Any other host (Vercel, Netlify, custom domain) → Replit production URL
const REPLIT_BACKEND = 'https://workspace.swiftsnowbro.replit.app/api';

function resolveApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h.includes('replit')) return '/api';
    return REPLIT_BACKEND; // Vercel / external frontend → call Replit backend directly
  }
  return '/api';
}

const API_BASE = resolveApiBase();
const TOKEN_KEY = 'veltrix_auth_token';

// ─── Token helpers ───────────────────────────────────────────────────────────
function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
function setToken(t: string | null) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {}
}

// ─── Auth change listeners ───────────────────────────────────────────────────
type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';
type AuthListener = (event: AuthEvent, session: any) => void;
const listeners: AuthListener[] = [];
function notifyListeners(event: AuthEvent, session: any) {
  for (const l of listeners) l(event, session);
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function apiFetch(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text }; }
}

// ─── Query Builder ────────────────────────────────────────────────────────────
type Filter = string; // "op:field:value"

class QueryBuilder {
  private _table: string;
  private _filters: Filter[] = [];
  private _or: string | null = null;
  private _order: string | null = null;
  private _limitVal: number | null = null;
  private _selectCols = '*';
  private _method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
  private _body: Record<string, any> | null = null;
  private _returning = false;
  private _returnSingle = false;
  private _single = false;
  private _maybeSingle = false;

  constructor(table: string) { this._table = table; }

  // ── Column selection ──
  select(cols = '*') {
    if (this._method === 'GET') {
      this._selectCols = cols;
    } else {
      this._returning = true;
      this._returnSingle = false;
    }
    return this;
  }

  // ── Filters ──
  eq(field: string, value: any) { this._filters.push(`eq:${field}:${value}`); return this; }
  neq(field: string, value: any) { this._filters.push(`neq:${field}:${value}`); return this; }
  in(field: string, values: any[]) { this._filters.push(`in:${field}:${JSON.stringify(values)}`); return this; }
  gte(field: string, value: any) { this._filters.push(`gte:${field}:${value}`); return this; }
  lte(field: string, value: any) { this._filters.push(`lte:${field}:${value}`); return this; }
  gt(field: string, value: any) { this._filters.push(`gt:${field}:${value}`); return this; }
  lt(field: string, value: any) { this._filters.push(`lt:${field}:${value}`); return this; }
  ilike(field: string, value: any) { this._filters.push(`ilike:${field}:${value}`); return this; }
  is(field: string, value: any) { this._filters.push(`is:${field}:${value}`); return this; }
  or(conditions: string) { this._or = conditions; return this; }
  order(field: string, opts: { ascending?: boolean } = {}) {
    this._order = `${field}:${opts.ascending === false ? 'desc' : 'asc'}`;
    return this;
  }
  limit(n: number) { this._limitVal = n; return this; }

  // ── Mutation methods ──
  insert(data: Record<string, any>) {
    this._method = 'POST';
    this._body = { data, type: 'insert' };
    return this;
  }
  update(data: Record<string, any>) {
    this._method = 'PATCH';
    this._body = { data, filters: this._filters };
    return this;
  }
  upsert(data: Record<string, any>, opts?: { onConflict?: string }) {
    this._method = 'POST';
    this._body = { data, type: 'upsert', onConflict: opts?.onConflict };
    return this;
  }
  delete() { this._method = 'DELETE'; return this; }

  // ── Terminators ──
  single() {
    if (this._method === 'GET') { this._single = true; }
    else { this._returning = true; this._returnSingle = true; }
    return this._exec();
  }
  maybeSingle() { this._maybeSingle = true; return this._exec(); }

  // ── Execution ──
  private async _exec(): Promise<{ data: any; error: any }> {
    try {
      const params = new URLSearchParams();
      if (this._selectCols !== '*') params.set('select', this._selectCols);
      for (const f of this._filters) params.append('filter', f);
      if (this._or) params.set('or', this._or);
      if (this._order) params.set('order', this._order);
      if (this._limitVal) params.set('limit', String(this._limitVal));
      if (this._single) params.set('single', 'true');
      if (this._maybeSingle) params.set('maybeSingle', 'true');
      const qs = params.toString();
      const url = `/data/${this._table}${qs ? `?${qs}` : ''}`;

      let result: any;
      if (this._method === 'GET') {
        result = await apiFetch(url);
      } else if (this._method === 'POST') {
        const body: any = { ...(this._body || {}), single: this._returnSingle };
        result = await apiFetch(url, { method: 'POST', body: JSON.stringify(body) });
      } else if (this._method === 'PATCH') {
        result = await apiFetch(`${url}`, { method: 'PATCH', body: JSON.stringify(this._body) });
      } else if (this._method === 'DELETE') {
        result = await apiFetch(`${url}`, { method: 'DELETE' });
      }

      if (result?.error) return { data: null, error: { message: result.error, code: result.code } };
      return { data: result?.data ?? result, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  // Makes the builder "thenable" — allows `await supabase.from(...).select()`
  then(resolve: (v: { data: any; error: any }) => any, reject?: (e: any) => any) {
    return this._exec().then(resolve, reject);
  }
}

// ─── Auth module ──────────────────────────────────────────────────────────────
const authModule = {
  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    const result = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, options }) });
    if (result.error) return { data: { user: null, session: null }, error: { message: result.error } };
    if (result.data?.session?.access_token) {
      setToken(result.data.session.access_token);
      notifyListeners('SIGNED_IN', result.data.session);
    }
    return { data: result.data, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const result = await apiFetch('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (result.error) return { data: { user: null, session: null }, error: { message: result.error } };
    if (result.data?.session?.access_token) {
      setToken(result.data.session.access_token);
      notifyListeners('SIGNED_IN', result.data.session);
    }
    return { data: result.data, error: null };
  },

  async signOut() {
    await apiFetch('/auth/signout', { method: 'POST' });
    setToken(null);
    notifyListeners('SIGNED_OUT', null);
    return { error: null };
  },

  async getSession() {
    const token = getToken();
    if (!token) return { data: { session: null }, error: null };
    const result = await apiFetch('/auth/session');
    if (result.error || !result.data?.session) {
      setToken(null);
      return { data: { session: null }, error: null };
    }
    if (result.data.session.access_token) setToken(result.data.session.access_token);
    return { data: result.data, error: null };
  },

  async getUser() {
    const result = await apiFetch('/auth/user');
    return { data: result.data || { user: null }, error: result.error || null };
  },

  onAuthStateChange(callback: AuthListener) {
    listeners.push(callback);

    // Fire immediately with current session state
    authModule.getSession().then(({ data }) => {
      if (data.session) callback('SIGNED_IN', data.session);
      else callback('SIGNED_OUT', null);
    });

    const subscription = {
      unsubscribe: () => {
        const idx = listeners.indexOf(callback);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    };
    return { data: { subscription } };
  },
};

// ─── RPC ──────────────────────────────────────────────────────────────────────
async function rpc(fn: string, params?: Record<string, any>): Promise<{ data: any; error: any }> {
  const result = await apiFetch(`/rpc/${fn}`, { method: 'POST', body: JSON.stringify(params || {}) });
  if (result?.error) return { data: null, error: { message: result.error } };
  return { data: result, error: null };
}

// ─── Main client export ───────────────────────────────────────────────────────
export const apiClient = {
  from: (table: string) => new QueryBuilder(table),
  auth: authModule,
  rpc,
};

export type ApiClient = typeof apiClient;
