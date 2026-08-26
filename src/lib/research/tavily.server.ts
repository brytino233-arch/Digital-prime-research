import type { ResearchQuery } from "./types";

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

export type WebSource = {
  title: string;
  url: string;
  content: string;
};

export async function searchWeb(query: ResearchQuery): Promise<WebSource[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error("Tavily API key is not configured.");
  }

  const searchQuery = `${query.businessType} in ${query.location}`;

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: searchQuery,
      search_depth: "basic",
      topic: "general",
      max_results: Math.min(Math.max(query.count * 3, 5), 15),
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Tavily search failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as TavilyResponse;

  return (data.results ?? [])
    .filter(
      (result) =>
        typeof result.title === "string" &&
        typeof result.url === "string" &&
        typeof result.content === "string",
    )
    .map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));
}