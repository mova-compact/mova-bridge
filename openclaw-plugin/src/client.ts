export interface MovaConfig {
  apiKey: string;
  baseUrl: string;
}

async function movaRequest(
  config: MovaConfig,
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export const movaPost = (c: MovaConfig, path: string, body: unknown) =>
  movaRequest(c, "POST", path, body);

export const movaGet = (c: MovaConfig, path: string) =>
  movaRequest(c, "GET", path);

export const movaPut = (c: MovaConfig, path: string, body: unknown) =>
  movaRequest(c, "PUT", path, body);

export const movaDelete = (c: MovaConfig, path: string) =>
  movaRequest(c, "DELETE", path);

export function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    details: data,
  };
}
