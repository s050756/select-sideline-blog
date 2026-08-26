import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://blog.selectsideline.com",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
  },
});
