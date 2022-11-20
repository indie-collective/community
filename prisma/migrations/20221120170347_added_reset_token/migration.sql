-- DropForeignKey
ALTER TABLE "game_change" DROP CONSTRAINT "game_change_author_id_fkey";

-- AlterTable
ALTER TABLE "game_change" ALTER COLUMN "author_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "reset_token" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "person_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_change" ADD CONSTRAINT "game_change_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_token" ADD CONSTRAINT "reset_token_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
