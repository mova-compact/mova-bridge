export interface MovaConfig {
  apiKey: string;
  baseUrl: string;
}

export async function movaPost(
  config: MovaConfig,
  path: string,
  body: unknown
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function movaGet(
  config: MovaConfig,
  path: string
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function movaPut(
  config: MovaConfig,
  path: string,
  body: unknown
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function movaDelete(
  config: MovaConfig,
  path: string
): Promise<unknown> {
  const url = `${config.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MOVA API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export function json(data: unknown): { content: [{ type: "text"; text: string }] } {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
