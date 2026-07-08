import { useCallback, useRef, useState } from "react";
import { Stack, Card, Flex, Box, Text, TextInput, Spinner } from "@sanity/ui";
import {
  useDocumentOperation,
  useFormValue,
  type StringInputProps,
} from "sanity";
import {
  searchBooks,
  searchFilms,
  fetchDirector,
  tmdbReady,
  slugify,
  type BookResult,
  type FilmResult,
} from "../lookups";

type Row = { key: string; title: string; sub?: string; img?: string; raw: any };

/**
 * A search box rendered at the top of the Book / Film forms. Type a title,
 * pick a result, and the sibling text fields fill in. Covers/posters fill
 * automatically at build time, so we only patch text here.
 */
function makeAutofill(mode: "book" | "film") {
  return function AutofillInput(_props: StringInputProps) {
    const rawId = (useFormValue(["_id"]) as string) || "";
    const id = rawId.replace(/^drafts\./, "");
    const type = useFormValue(["_type"]) as string;
    const { patch } = useDocumentOperation(id, type);

    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    const onChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
      const q = e.currentTarget.value.trim();
      clearTimeout(timer.current);
      setError(null);
      if (q.length < 3) {
        setRows([]);
        setSearched(false);
        return;
      }
      timer.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          if (mode === "book") {
            const res = await searchBooks(q);
            setRows(
              res.map((b: BookResult, i) => ({
                key: `${b.title}-${i}`,
                title: b.title,
                sub: [b.author, b.year].filter(Boolean).join(" · "),
                img: b.coverUrl,
                raw: b,
              })),
            );
          } else {
            const res = await searchFilms(q);
            setRows(
              res.map((f: FilmResult) => ({
                key: String(f.id),
                title: f.title,
                sub: f.year ? String(f.year) : undefined,
                img: f.posterUrl,
                raw: f,
              })),
            );
          }
          setSearched(true);
        } catch (err: any) {
          setRows([]);
          setError(err?.message || "Search failed");
        } finally {
          setLoading(false);
        }
      }, 350);
    }, []);

    const pick = useCallback(
      async (row: Row) => {
        setBusy(true);
        try {
          const fields: Record<string, unknown> = {
            slug: { _type: "slug", current: slugify(row.title) },
          };
          if (mode === "book") {
            const b = row.raw as BookResult;
            fields.title = b.title;
            if (b.author) fields.author = b.author;
          } else {
            const f = row.raw as FilmResult;
            fields.title = f.title;
            if (f.year) fields.year = f.year;
            const director = await fetchDirector(f.id);
            if (director) fields.director = director;
          }
          patch.execute([{ set: fields }]);
          setRows([]);
        } finally {
          setBusy(false);
        }
      },
      [patch],
    );

    if (mode === "film" && !tmdbReady) {
      return (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>
            Set <code>SANITY_STUDIO_TMDB_API_KEY</code> in the Studio env to enable
            film search.
          </Text>
        </Card>
      );
    }

    return (
      <Stack space={3}>
        <TextInput
          placeholder={
            mode === "book" ? "Search a book title…" : "Search a film title…"
          }
          onChange={onChange}
          disabled={busy}
        />
        {(loading || busy) && <Spinner muted />}
        {error && (
          <Card padding={3} radius={2} tone="critical" border>
            <Text size={1}>{error}</Text>
          </Card>
        )}
        {searched && !loading && !error && rows.length === 0 && (
          <Text size={1} muted>
            No matches — try a different title.
          </Text>
        )}
        {rows.map((row) => (
          <Card
            key={row.key}
            as="button"
            padding={2}
            radius={2}
            shadow={1}
            onClick={() => pick(row)}
            style={{ cursor: "pointer", width: "100%", textAlign: "left" }}
          >
            <Flex align="center" gap={3}>
              {row.img && (
                <img
                  src={row.img}
                  alt=""
                  width={34}
                  height={50}
                  style={{ objectFit: "cover", borderRadius: 3, flexShrink: 0 }}
                />
              )}
              <Box flex={1}>
                <Text size={1} weight="semibold">
                  {row.title}
                </Text>
                {row.sub && (
                  <Box marginTop={1}>
                    <Text size={1} muted>
                      {row.sub}
                    </Text>
                  </Box>
                )}
              </Box>
            </Flex>
          </Card>
        ))}
      </Stack>
    );
  };
}

export const BookAutofill = makeAutofill("book");
export const FilmAutofill = makeAutofill("film");
