CREATE TYPE "public"."youtube_connection_status" AS ENUM('connected', 'needs_reconnect');--> statement-breakpoint
CREATE TABLE "youtube_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" text NOT NULL,
	"channel_title" text NOT NULL,
	"channel_handle" text,
	"channel_thumbnail_url" text,
	"uploads_playlist_id" text,
	"connected_email" text,
	"scopes" text[] DEFAULT '{}' NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"status" "youtube_connection_status" DEFAULT 'connected' NOT NULL,
	"last_error" text,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_connection_channel_id_unique" UNIQUE("channel_id")
);
