-- A project's photography becomes its media: the same ordered list, now able to
-- hold a film uploaded to our own cloud or a YouTube/Vimeo embed beside the
-- photographs. The column is renamed rather than joined by a second one,
-- because the order across all three kinds is what the lightbox reads off it.

-- AlterTable
ALTER TABLE "projects" RENAME COLUMN "images" TO "media";

-- Every entry written before this is a photograph, so each gains the `type` key
-- that now tells the three apart. `lib/project-media` reads a missing one as an
-- image anyway — a Json column is not a schema — but a backfilled row is one
-- Prisma Studio and a hand-written query can be read straight off too.
--
-- Rebuilt entry by entry rather than patched in place so the arranged order
-- survives, and so an entry with no source at all is dropped rather than
-- carried forward as a tile with nothing behind it. A row holding an empty
-- array, or something that is not an array, is left exactly as it is.
UPDATE "projects" AS p
SET "media" = rebuilt.media
FROM (
  SELECT
    source.id,
    jsonb_agg(
      jsonb_build_object(
        'type', COALESCE(entry->>'type', 'image'),
        'src', entry->>'src',
        'alt', COALESCE(entry->>'alt', '')
      )
      ORDER BY ordinality
    ) AS media
  FROM "projects" AS source
  CROSS JOIN LATERAL jsonb_array_elements(source."media") WITH ORDINALITY AS t(entry, ordinality)
  WHERE jsonb_typeof(source."media") = 'array'
    AND entry->>'src' IS NOT NULL
  GROUP BY source.id
) AS rebuilt
WHERE p.id = rebuilt.id;
