const API_URL = "https://writerpro.vercel.app/api/cms/posts";
const API_KEY = "wp_live_3bjrx0fnda3xcu2z23egaa";

export interface CMSPost {
  title: string;
  slug: string;
  markdownContent: string;
  // Fallbacks if CMS doesn't provide them yet, to keep the UI intact
  description?: string;
  thumbnail?: string;
  date?: string; 
  readTime?: string;
  tags?: string[];
}

let cachedPosts: CMSPost[] | null = null;
let lastFetchTime = 0;
// 10 second cache TTL for quick transitions but still fresh data
const CACHE_TTL = 1000 * 10;

export async function getAllPosts(): Promise<CMSPost[]> {
  const now = Date.now();
  if (cachedPosts && now - lastFetchTime < CACHE_TTL) {
    return cachedPosts;
  }

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    // Bypass Node's built-in fetch caching so we don't get stuck with stale data
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS posts: ${response.statusText}`);
  }

  cachedPosts = await response.json();
  lastFetchTime = now;
  return cachedPosts!;
}

export async function getPostBySlug(slug: string): Promise<CMSPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}
