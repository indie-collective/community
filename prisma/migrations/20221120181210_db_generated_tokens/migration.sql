-- AlterTable
ALTER TABLE "reset_token" ALTER COLUMN "token" SET DEFAULT gen_random_uuid();
