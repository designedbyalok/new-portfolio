import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { markdownSchema } from "sanity-plugin-markdown";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "portfolio",
  title: "designedbyalok",
  projectId: "j4cazn05",
  dataset: "production",
  plugins: [structureTool(), markdownSchema()],
  schema: { types: schemaTypes },
});
