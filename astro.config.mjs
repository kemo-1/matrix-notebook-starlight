// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import starlightThemeObsidian from "starlight-theme-obsidian";
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@components": "/src/components",
        "@": "/src",
      },
    },
  },
  integrations: [
    starlight({
      plugins: [
        starlightThemeObsidian({
          graph: false,
        }),
      ],
      tableOfContents: {
        minHeadingLevel: 1,
        maxHeadingLevel: 6,
      },
      customCss: ["./src/assets/main.css"],
      title: "Matrix Notebook",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      // sidebar: [

      // {
      //   label: "Api",

      //   // Each item here is one entry in the navigation menu.
      //   autogenerate: { directory: "Api" },
      // },
      // {
      //   label: "Reference",
      //   autogenerate: { directory: "refrence" },
      // },
      // ],
    }),
    react(),
  ],
});
