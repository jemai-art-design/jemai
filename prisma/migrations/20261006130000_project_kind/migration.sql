-- Festive projects are design projects shown somewhere else: the same copy, the
-- same photography, the same switch, drawn on the Christmas styling page rather
-- than the JEMAI Designs rail. So they share this table and differ by `kind`.
--
-- Everything already here is a design project, which is what the default says.

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'design';

-- The rails are ordered independently, so the lookup leads on the kind.
-- DropIndex
DROP INDEX "projects_isActive_position_idx";

-- CreateIndex
CREATE INDEX "projects_kind_isActive_position_idx" ON "projects"("kind", "isActive", "position");
