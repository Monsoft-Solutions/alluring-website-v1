-- Migration: Chat UX and Value Enhancement
-- Adds quick replies, intent classification, lead scoring, and human handoff capabilities

-- ============================================
-- Quick Reply Table
-- ============================================
CREATE TABLE IF NOT EXISTS "chat_quick_reply" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "label" text NOT NULL,
    "message" text NOT NULL,
    "category" text DEFAULT 'general' NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "click_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- Escalation Trigger Table
-- ============================================
CREATE TABLE IF NOT EXISTS "chat_escalation_trigger" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trigger_type" text NOT NULL,
    "trigger_value" text NOT NULL,
    "description" text,
    "priority" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "trigger_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- Chat Session Table Additions
-- ============================================

-- Intent Classification Fields
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "primary_intent" text;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "intent_confidence" numeric(3, 2);
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "detected_procedures" jsonb;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "tags" jsonb;

-- Lead Scoring Fields
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "lead_score" integer DEFAULT 0 NOT NULL;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "lead_grade" text;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "scoring_signals" jsonb;

-- Human Handoff Fields
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "is_escalated" boolean DEFAULT false NOT NULL;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "escalated_at" timestamp;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "escalation_reason" text;
ALTER TABLE "chat_session" ADD COLUMN IF NOT EXISTS "assigned_to" text;

-- ============================================
-- Seed Default Quick Replies
-- ============================================
INSERT INTO "chat_quick_reply" ("label", "message", "category", "sort_order") VALUES
    ('Learn About Procedures', 'I''d like to learn about your procedures', 'initial', 1),
    ('Pricing Information', 'What are your pricing options?', 'initial', 2),
    ('Schedule Consultation', 'I''d like to schedule a consultation', 'initial', 3),
    ('BBL Information', 'Tell me about Brazilian Butt Lift (BBL)', 'procedures', 1),
    ('Breast Augmentation', 'Tell me about breast augmentation options', 'procedures', 2),
    ('Tummy Tuck Details', 'What should I know about tummy tuck?', 'procedures', 3),
    ('Mommy Makeover', 'What''s included in a mommy makeover?', 'procedures', 4),
    ('Liposuction Options', 'Tell me about liposuction', 'procedures', 5),
    ('Financing Options', 'What financing options do you offer?', 'pricing', 1),
    ('Payment Plans', 'Do you have payment plans available?', 'pricing', 2),
    ('Book Consultation', 'I''m ready to book a consultation', 'scheduling', 1),
    ('Office Hours', 'What are your office hours?', 'scheduling', 2),
    ('Recovery Time', 'What''s the typical recovery time?', 'general', 1),
    ('Talk to Someone', 'I''d like to speak with a team member', 'general', 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Default Escalation Triggers
-- ============================================
INSERT INTO "chat_escalation_trigger" ("trigger_type", "trigger_value", "description", "priority") VALUES
    ('keyword', 'speak to human', 'User requests human agent', 10),
    ('keyword', 'talk to someone', 'User requests human agent', 10),
    ('keyword', 'real person', 'User requests human agent', 10),
    ('keyword', 'human agent', 'User requests human agent', 10),
    ('keyword', 'frustrated', 'User expresses frustration', 8),
    ('keyword', 'angry', 'User expresses anger', 8),
    ('keyword', 'complaint', 'User has complaint', 7),
    ('keyword', 'manager', 'User requests manager', 9),
    ('keyword', 'supervisor', 'User requests supervisor', 9),
    ('intent', 'complaint', 'Detected complaint intent', 8),
    ('manual', 'user_request', 'User clicked handoff button', 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS "idx_chat_session_lead_grade" ON "chat_session" ("lead_grade");
CREATE INDEX IF NOT EXISTS "idx_chat_session_lead_score" ON "chat_session" ("lead_score");
CREATE INDEX IF NOT EXISTS "idx_chat_session_is_escalated" ON "chat_session" ("is_escalated");
CREATE INDEX IF NOT EXISTS "idx_chat_session_primary_intent" ON "chat_session" ("primary_intent");
CREATE INDEX IF NOT EXISTS "idx_chat_quick_reply_category" ON "chat_quick_reply" ("category");
CREATE INDEX IF NOT EXISTS "idx_chat_quick_reply_active" ON "chat_quick_reply" ("is_active");

