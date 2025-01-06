// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import { BLOG } from "./src/config";

import react from "@astrojs/react";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: BLOG.website,
  integrations: [mdx(), sitemap(), tailwind(), react()],
  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-dark", dark: "min-dark" },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});
