CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE "users" IS 'Users table';

COMMENT ON COLUMN "users"."id" IS 'User ID';

COMMENT ON COLUMN "users"."email" IS 'User email';

COMMENT ON COLUMN "users"."name" IS 'User name';

COMMENT ON COLUMN "users"."created_at" IS 'User creation date';

