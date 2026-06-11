export const prerender = false;

import type { APIRoute } from "astro";
import { getListeningData } from "../../lib/spotify";

export const GET: APIRoute = async () => {
  const data = await getListeningData();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
};
