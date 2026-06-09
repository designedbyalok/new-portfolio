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

export async function getAllPosts(): Promise<CMSPost[]> {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS posts: ${response.statusText}`);
  }

  return response.json();
}

export async function getPostBySlug(slug: string): Promise<CMSPost | undefined> {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}
