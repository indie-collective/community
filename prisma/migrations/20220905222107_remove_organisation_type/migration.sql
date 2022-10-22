/*
  Warnings:

  - The values [organisation] on the enum `entity_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "entity_type_new" AS ENUM ('studio', 'association');
ALTER TABLE "entity" ALTER COLUMN "type" TYPE "entity_type_new" USING ("type"::text::"entity_type_new");
ALTER TYPE "entity_type" RENAME TO "entity_type_old";
ALTER TYPE "entity_type_new" RENAME TO "entity_type";
DROP TYPE "entity_type_old";
COMMIT;
