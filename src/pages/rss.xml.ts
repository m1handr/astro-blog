import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { BLOG } from "../config";

export async function GET() {
  const posts = await getCollection("blog");
  return rss({
    title: BLOG.title,
    description: BLOG.description,
    site: BLOG.website,
    items: posts.map(({ id, data }) => ({
      link: `blog/${id}/`,
      title: data.title,
      description: data.description,
      pubDate: data.pubDate,
    })),
  });
}
