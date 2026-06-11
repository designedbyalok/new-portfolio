# Spotify "Listening to…" setup

The about page card is powered by `/api/spotify.json` (a serverless route) and
`src/lib/spotify.ts`, which use Spotify's refresh-token flow. One-time setup:

## 1. Create a Spotify app

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and create an app.
2. In the app settings, add this Redirect URI exactly:

   ```
   http://127.0.0.1:8888/callback
   ```

3. Note the **Client ID** and **Client Secret**.

## 2. Authorize once and grab the code

Open this URL in a browser (replace `YOUR_CLIENT_ID`). The scopes needed are
`user-read-currently-playing` and `user-read-recently-played`:

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&scope=user-read-currently-playing%20user-read-recently-played
```

Approve access. The browser redirects to
`http://127.0.0.1:8888/callback?code=...` — the page won't load (nothing is
listening there); just copy the `code` value from the address bar. Use it
quickly — it expires in a few minutes.

## 3. Exchange the code for a refresh token

```bash
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
CODE=paste_code_from_step_2

curl -s https://accounts.spotify.com/api/token \
  -H "Authorization: Basic $(printf '%s' "$CLIENT_ID:$CLIENT_SECRET" | base64)" \
  -d grant_type=authorization_code \
  -d code="$CODE" \
  -d redirect_uri="http://127.0.0.1:8888/callback"
```

Copy the `refresh_token` from the JSON response. It does not expire (unless
access is revoked), so this is a one-time step.

## 4. Set environment variables

Locally, in `.env` (see `.env.example`):

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...
```

On Vercel: Project → Settings → Environment Variables — add the same three
keys (Production + Preview), then redeploy.

## Notes

- The credentials are server-side only (`import.meta.env`, never shipped to the
  browser). The API route caches responses for 60s.
- Without credentials (or if Spotify is unreachable), the card quietly shows
  "Not listening right now." — the build and the page still succeed.
- Track preview audio (`previewUrl`) is unavailable for newer Spotify apps; the
  play button then opens the track on Spotify instead.
