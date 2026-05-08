-- V1__create_suggestion_tables.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Phase 1: User applies for permission to suggest
CREATE TABLE suggestion_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    motivation TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON suggestion_applications(user_id);
CREATE INDEX idx_applications_status ON suggestion_applications(status);

-- Phase 2: Approved user submits an event suggestion
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suggested_display_date DATE NOT NULL,   -- e.g. 2026-05-08 (when to show)
    suggested_event_year INT NOT NULL,       -- e.g. 1945 (historical year)
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    youtube_url VARCHAR(500),
    source_urls TEXT,                        -- JSON array of {title, url}
    locale VARCHAR(5) NOT NULL DEFAULT 'tr',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    admin_note TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suggestions_user ON suggestions(user_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);
