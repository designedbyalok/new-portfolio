// One-time helper: captures the Spotify OAuth code on 127.0.0.1:8888,
// exchanges it for a refresh token, and writes it into .env.
// Run: bun scripts/spotify-auth.ts   (then open the printed authorize URL)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPE = "user-read-currently-playing user-read-recently-played";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in env.");
  process.exit(1);
}

const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  }).toString();

console.log("\n1. Open this URL in your browser and click Agree:\n");
console.log(authorizeUrl + "\n");
console.log("2. Waiting for the redirect on " + REDIRECT_URI + " ...\n");

async function writeEnv(refreshToken: string) {
  const path = ".env";
  let text = "";
  try {
    text = await Bun.file(path).text();
  } catch {}
  const line = `SPOTIFY_REFRESH_TOKEN=${refreshToken}`;
  if (/^SPOTIFY_REFRESH_TOKEN=.*$/m.test(text)) {
    text = text.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line);
  } else {
    text = text.trimEnd() + "\n" + line + "\n";
  }
  await Bun.write(path, text);
}

const server = Bun.serve({
  port: 8888,
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/callback") {
      return new Response("Waiting for /callback…", { status: 404 });
    }
    const error = url.searchParams.get("error");
    if (error) {
      console.error("Authorization denied:", error);
      setTimeout(() => process.exit(1), 100);
      return new Response("Authorization denied: " + error, { status: 400 });
    }
    const code = url.searchParams.get("code");
    if (!code) return new Response("No code in callback.", { status: 400 });

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = (await res.json()) as { refresh_token?: string; error?: string; error_description?: string };
    if (!res.ok || !data.refresh_token) {
      console.error("Token exchange failed:", JSON.stringify(data));
      setTimeout(() => process.exit(1), 100);
      return new Response("Token exchange failed: " + JSON.stringify(data), { status: 500 });
    }

    await writeEnv(data.refresh_token);
    console.log("\n✅ SPOTIFY_REFRESH_TOKEN captured and written to .env\n");
    console.log("Refresh token (also add this to Vercel env):\n");
    console.log(data.refresh_token + "\n");
    setTimeout(() => process.exit(0), 200);
    return new Response(
      "<h2>Done ✅</h2><p>Refresh token captured. You can close this tab and return to the terminal.</p>",
      { headers: { "Content-Type": "text/html" } },
    );
  },
});

// Safety timeout so the listener never hangs forever.
setTimeout(() => {
  console.error("\nTimed out after 5 minutes with no callback. Re-run the script.");
  server.stop();
  process.exit(1);
}, 5 * 60 * 1000);
