const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

export const apiGet = <T>(path: string, token?: string) => api<T>(path, { token });
export const apiPost = <T>(path: string, body: unknown, token?: string) => api<T>(path, { method: "POST", body, token });
export const apiPatch = <T>(path: string, body: unknown, token?: string) => api<T>(path, { method: "PATCH", body, token });
export const apiPut = <T>(path: string, body: unknown, token?: string) => api<T>(path, { method: "PUT", body, token });
export const apiDelete = <T>(path: string, token?: string) => api<T>(path, { method: "DELETE", token });
