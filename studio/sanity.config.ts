import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { markdownSchema } from "sanity-plugin-markdown";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "portfolio",
  title: "designedbyalok",
  projectId: "j4cazn05",
  dataset: "production",
  plugins: [
    structureTool({
      // Mirror the site's navigation. Two notes:
      // - "Case studies" are the `idea` document type (the type name is kept
      //   for data compatibility; only the label changed).
      // - Projects and Work experience are both `work` documents, split by
      //   the `kind` field — same split the site uses.
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Case studies")
              .child(S.documentTypeList("idea").title("Case studies")),
            S.listItem()
              .title("Projects")
              .child(
                S.documentList()
                  .title("Projects")
                  .filter('_type == "work" && kind == "project"'),
              ),
            S.listItem()
              .title("Work experience")
              .child(
                S.documentList()
                  .title("Work experience")
                  .filter('_type == "work" && (!defined(kind) || kind == "experience")'),
              ),
            S.listItem()
              .title("Blog posts")
              .child(S.documentTypeList("post").title("Blog posts")),
            S.divider(),
            S.listItem()
              .title("Books")
              .child(S.documentTypeList("book").title("Books")),
            S.listItem()
              .title("Films")
              .child(S.documentTypeList("film").title("Films")),
            S.listItem()
              .title("Archive")
              .child(S.documentTypeList("archiveEntry").title("Archive")),
            S.listItem()
              .title("Photos")
              .child(S.documentTypeList("photo").title("Photos")),
          ]),
    }),
    markdownSchema(),
  ],
  schema: { types: schemaTypes },
});
