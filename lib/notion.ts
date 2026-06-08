import { normalizeNotionProps } from "./parse";

// Extract the page ID from a Notion URL or pass through a bare UUID.
export function extractPageId(input: string): string {
  // Handle share/copy URLs like https://app.notion.com/p/Name-<id>?...
  // and standard https://www.notion.so/workspace/Name-<id>
  const clean = input.split("?")[0];
  const match = clean.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:[^a-f0-9]|$)/i);
  if (!match) throw new Error(`Could not extract a Notion page ID from: ${input}`);
  // Notion API expects dashed UUID format
  const raw = match[1].replace(/-/g, "");
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

export async function notionFetch(identifier: string): Promise<Record<string, string | null>> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN env var is not set.");

  const pageId = extractPageId(identifier);

  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { properties: Record<string, unknown> };
  return normalizeNotionProps(data.properties);
}
