// Server-side Spotify client for the "Listening to..." card.
// Uses the refresh-token flow; never throws — any failure resolves to the
// empty state so the page (and build) always succeeds.

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=10";

export type Track = {
  title: string;
  artist: string;
  album: string;
  coverImage: string;
  songUrl: string;
  previewUrl: string | null;
};

export type ListeningData = {
  isPlaying: boolean;
  current: (Track & { progressMs?: number; durationMs?: number }) | null;
  recent: Track[];
};

const EMPTY: ListeningData = { isPlaying: false, current: null, recent: [] };

function encodeBasic(id: string, secret: string): string {
  const raw = `${id}:${secret}`;
  if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf-8").toString("base64");
  return btoa(raw);
}

export async function refreshAccessToken(): Promise<string | null> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasic(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });
  if (!res.ok) return null;
  const json: any = await res.json();
  return typeof json?.access_token === "string" ? json.access_token : null;
}

export async function getNowPlaying(accessToken?: string): Promise<any | null> {
  const token = accessToken ?? (await refreshAccessToken());
  if (!token) return null;
  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204 || !res.ok) return null; // 204 = nothing playing
  return res.json();
}

export async function getRecentlyPlayed(accessToken?: string): Promise<any | null> {
  const token = accessToken ?? (await refreshAccessToken());
  if (!token) return null;
  const res = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

function normalizeTrack(item: any): Track | null {
  if (!item || typeof item.name !== "string") return null;
  const artists = Array.isArray(item.artists) ? item.artists : [];
  return {
    title: item.name,
    artist: artists
      .map((a: any) => (typeof a?.name === "string" ? a.name : ""))
      .filter(Boolean)
      .join(", "),
    album: typeof item.album?.name === "string" ? item.album.name : "",
    coverImage: item.album?.images?.[0]?.url ?? "",
    songUrl: item.external_urls?.spotify ?? "",
    // Spotify removed preview URLs for newer apps — nullable everywhere.
    previewUrl: item.preview_url ?? null,
  };
}

const titleArtistKey = (t: Track) => `${t.title}|${t.artist}`.toLowerCase();

// Module-level memo with a 60s TTL (also caches failures to avoid hammering).
let memo: { data: ListeningData; expires: number } | null = null;
const TTL_MS = 60_000;

export async function getListeningData(): Promise<ListeningData> {
  if (memo && memo.expires > Date.now()) return memo.data;

  let result: ListeningData = EMPTY;
  try {
    const token = await refreshAccessToken();
    if (token) {
      const [now, recentRaw] = await Promise.all([
        getNowPlaying(token).catch(() => null),
        getRecentlyPlayed(token).catch(() => null),
      ]);

      const base = now?.currently_playing_type === "episode" ? null : normalizeTrack(now?.item);
      let current: ListeningData["current"] = null;
      if (base) {
        current = { ...base };
        if (Number.isFinite(Number(now?.progress_ms))) current.progressMs = Number(now.progress_ms);
        if (Number.isFinite(Number(now?.item?.duration_ms)))
          current.durationMs = Number(now.item.duration_ms);
      }

      // Dedupe recent by cover image and by title+artist; exclude the
      // currently-playing track.
      const seen = new Set<string>();
      if (current) {
        seen.add(titleArtistKey(current));
        if (current.coverImage) seen.add(current.coverImage);
      }
      const recent: Track[] = [];
      const items = recentRaw?.items;
      if (Array.isArray(items)) {
        for (const it of items) {
          const t = normalizeTrack(it?.track);
          if (!t) continue;
          if (seen.has(titleArtistKey(t)) || (t.coverImage && seen.has(t.coverImage))) continue;
          seen.add(titleArtistKey(t));
          if (t.coverImage) seen.add(t.coverImage);
          recent.push(t);
        }
      }

      result = { isPlaying: !!(now?.is_playing && current), current, recent };
    }
  } catch {
    result = EMPTY;
  }

  memo = { data: result, expires: Date.now() + TTL_MS };
  return result;
}
