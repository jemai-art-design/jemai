-- The storefront's static photography becomes editable. Only overrides live
-- here: a location with no row still draws the picture the site shipped with,
-- so this table starts empty and "reset to default" is a delete.

-- CreateTable
CREATE TABLE "site_image_slots" (
    "id" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "images" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_image_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_image_slots_slot_key" ON "site_image_slots"("slot");
