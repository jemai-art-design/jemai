-- Media moves from the product to the variant: a buyer picks a combination and
-- sees that combination's shots, so the sources hang off the row they belong to.
-- The product keeps its thumbnail, which stands for the whole piece.

-- AlterTable
ALTER TABLE "furniture_variants" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Every existing variant inherits its product's first three gallery shots, so
-- no product comes out of this migration with an image-less row. A product that
-- never had a gallery falls back to its thumbnail; one with neither leaves its
-- variants empty, and the console's form asks for the images on the next save.
UPDATE "furniture_variants" AS v
SET "images" = source."images"
FROM (
  SELECT
    f."id",
    CASE
      WHEN cardinality(f."gallery") > 0 THEN f."gallery"[1:3]
      WHEN f."thumbnail" IS NOT NULL THEN ARRAY[f."thumbnail"]
      ELSE ARRAY[]::TEXT[]
    END AS "images"
  FROM "furniture" AS f
) AS source
WHERE v."furnitureId" = source."id";

-- AlterTable
ALTER TABLE "furniture" DROP COLUMN "gallery";
