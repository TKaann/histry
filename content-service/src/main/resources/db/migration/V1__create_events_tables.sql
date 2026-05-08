-- V1__create_events_tables.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core events table (language-agnostic)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- display_date: when to show this event (e.g. 2026-05-07 → show on May 7, 2026)
    display_date DATE NOT NULL,
    -- event_year: the actual historical year (used for the guessing game answer)
    event_year INT NOT NULL,
    location_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    youtube_url VARCHAR(500),
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_display_date ON events(display_date);
CREATE INDEX idx_events_month_day ON events(EXTRACT(MONTH FROM display_date), EXTRACT(DAY FROM display_date));

-- Localized content per event (scalable: add FR, DE etc. with new rows only)
CREATE TABLE event_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    UNIQUE(event_id, locale)
);

CREATE INDEX idx_event_translations_event_locale ON event_translations(event_id, locale);

-- Source links per event (can also be localized)
CREATE TABLE event_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL DEFAULT 'all',
    source_title VARCHAR(255) NOT NULL,
    source_url VARCHAR(500) NOT NULL
);

CREATE INDEX idx_event_sources_event ON event_sources(event_id);
