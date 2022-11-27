-- CreateTable
CREATE TABLE "reset_token" (
    "id" UUID NOT NULL DEFAULT public.uuid_generate_v4(),
    "person_id" UUID NOT NULL,
    "token" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_token_pkey" PRIMARY KEY ("id")
);
