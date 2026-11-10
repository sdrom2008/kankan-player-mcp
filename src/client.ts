const DEFAULT_BASE = "https://kankanplayer.com/api/bot-mcp/v1";
const DEFAULT_HOST_SUFFIX = "kankanplayer.com";
const STALE_HOST = "api.kankanplayer.com";

export function redactSecrets(text: string, apiKey?: string): string {
  let out = text ?? "";
  if (apiKey) out = out.split(apiKey).join("[redacted]");
  out = out.replace(/kkp_[A-Za-z0-9]+/g, "kkp_[redacted]");
  out = out.replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
  out = out.replace(/Authorization:\s*\S+/gi, "Authorization: [redacted]");
  out = out.replace(/X-Api-Key:\s*\S+/gi, "X-Api-Key: [redacted]");
  return out;
}

/** Suffix must stay under kankanplayer.com so the API key cannot be sent to an arbitrary host. */
export function allowedHostSuffix(): string {
  const suffix = (process.env.KANKAN_PLAYER_MCP_ALLOWED_HOST_SUFFIX || DEFAULT_HOST_SUFFIX)
    .trim()
    .toLowerCase()
    .replace(/^\.+/, "")
    .replace(/\.+$/, "");
  if (suffix !== "kankanplayer.com" && !suffix.endsWith(".kankanplayer.com")) {
    throw new Error(
      "KANKAN_PLAYER_MCP_ALLOWED_HOST_SUFFIX must be kankanplayer.com or a subdomain of kankanplayer.com."
    );
  }
  return suffix;
}

export function rewriteOfficialHost(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname.toLowerCase() === STALE_HOST) {
      url.hostname = "kankanplayer.com";
      return url.toString();
    }
  } catch {
    return raw;
  }
  return raw;
}

/** https only, host must be the suffix (default kankanplayer.com) or a subdomain of it. */
export function assertBaseUrl(raw: string): string {
  const rewritten = rewriteOfficialHost(raw);
  let url: URL;
  try {
    url = new URL(rewritten);
  } catch {
    throw new Error("KANKAN_PLAYER_MCP_BASE_URL is not a valid URL.");
  }
  const host = url.hostname.toLowerCase();
  const suffix = allowedHostSuffix();
  const local =
    process.env.KANKAN_PLAYER_MCP_ALLOW_INSECURE_LOCAL === "1"
    && (host === "localhost" || host === "127.0.0.1")
    && (url.protocol === "http:" || url.protocol === "https:");
  const allowedHost = host === suffix || host.endsWith(`.${suffix}`);
  if (!local && (url.protocol !== "https:" || !allowedHost)) {
    throw new Error(
      `KANKAN_PLAYER_MCP_BASE_URL must be https and the host must be ${suffix} or a subdomain of it. For a local API set KANKAN_PLAYER_MCP_ALLOW_INSECURE_LOCAL=1 and use http://localhost.`
    );
  }
  return url.toString().replace(/\/$/, "");
}

export class KankanPlayerClient {
  readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, baseUrl = process.env.KANKAN_PLAYER_MCP_BASE_URL || DEFAULT_BASE) {
    if (!apiKey) {
      throw new Error(
        "Missing KANKAN_PLAYER_MCP_API_KEY. Generate a key on the 看看播放器 account page, then set that env var."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = assertBaseUrl(baseUrl);
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: Record<string, unknown> | null,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
    const init: RequestInit = {
      method,
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(25_000),
    };
    if (body !== undefined && body !== null && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(redactSecrets(`看看播放器 ${method} ${path} failed: ${message}`, this.apiKey));
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" && data && "message" in data
          ? String((data as { message: unknown }).message)
          : text || res.statusText;
      throw new Error(redactSecrets(`看看播放器 ${method} ${path} → ${res.status}: ${msg}`, this.apiKey));
    }
    return data as T;
  }

  get<T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("GET", path, null, query);
  }

  post<T = unknown>(path: string, body?: Record<string, unknown>) {
    return this.request<T>("POST", path, body ?? {});
  }
}
