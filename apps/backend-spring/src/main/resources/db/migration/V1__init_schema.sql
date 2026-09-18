-- ============================================
-- Streamify — V1 Initial Schema (PostgreSQL / Neon)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- trigram index for fuzzy search

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name       VARCHAR(30) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(60) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    avatar_public_id VARCHAR(255),
    cover_image_url TEXT,
    cover_image_public_id VARCHAR(255),
    google_id       VARCHAR(255) UNIQUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMPTZ,
    refresh_token   TEXT,
    notification_preferences JSONB NOT NULL DEFAULT '{
        "email": {"likes": true, "comments": true, "subscriptions": true, "uploads": true, "system": true},
        "push":  {"likes": true, "comments": true, "subscriptions": true, "uploads": true, "system": true},
        "inApp": {"likes": true, "comments": true, "subscriptions": true, "uploads": true, "system": true}
    }'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_user_name ON users (user_name);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_full_name_trgm ON users USING gin (full_name gin_trgm_ops);

-- ============================================
-- VIDEOS
-- ============================================
CREATE TABLE videos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    video_url       TEXT NOT NULL,
    video_public_id VARCHAR(255) NOT NULL,
    thumbnail_url   TEXT NOT NULL,
    thumbnail_public_id VARCHAR(255) NOT NULL,
    duration        DOUBLE PRECISION NOT NULL DEFAULT 0,
    views           BIGINT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    slug            VARCHAR(100) UNIQUE,
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_videos_owner ON videos (owner_id, created_at DESC);
CREATE INDEX idx_videos_owner_deleted ON videos (owner_id, is_deleted);
CREATE INDEX idx_videos_feed ON videos (is_published, is_deleted, created_at DESC);
CREATE INDEX idx_videos_views ON videos (views DESC);
CREATE INDEX idx_videos_tags ON videos USING gin (tags);
CREATE INDEX idx_videos_slug ON videos (slug);
CREATE INDEX idx_videos_created_at ON videos (created_at DESC);

-- Full-text search index
ALTER TABLE videos ADD COLUMN search_vector TSVECTOR;

CREATE INDEX idx_videos_search ON videos USING gin (search_vector);

-- Function to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION videos_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_videos_search_vector
    BEFORE INSERT OR UPDATE OF title, description, tags ON videos
    FOR EACH ROW
    EXECUTE FUNCTION videos_search_vector_update();

-- ============================================
-- TWEETS
-- ============================================
CREATE TABLE tweets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tweets_owner ON tweets (owner_id);
CREATE INDEX idx_tweets_created_at ON tweets (created_at DESC);

-- ============================================
-- COMMENTS (polymorphic: Video or Tweet; self-referencing for threads)
-- ============================================
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    entity_type     VARCHAR(10) NOT NULL CHECK (entity_type IN ('Video', 'Tweet')),
    entity_id       UUID NOT NULL,
    parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    reply_count     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments (entity_type, entity_id, parent_id, created_at DESC);
CREATE INDEX idx_comments_owner ON comments (owner_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments (parent_id);

-- ============================================
-- COMMENT_HEARTS (content owner can heart comments)
-- ============================================
CREATE TABLE comment_hearts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (comment_id, user_id)
);

-- ============================================
-- LIKES (polymorphic: Video, Tweet, or Comment)
-- ============================================
CREATE TABLE likes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    liked_by        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type     VARCHAR(10) NOT NULL CHECK (entity_type IN ('Video', 'Tweet', 'Comment')),
    entity_id       UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (liked_by, entity_type, entity_id)
);

CREATE INDEX idx_likes_entity ON likes (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_likes_user ON likes (liked_by, entity_type, created_at DESC);

-- ============================================
-- SUBSCRIPTIONS (channel subscriptions)
-- ============================================
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (subscriber_id, channel_id),
    CHECK (subscriber_id <> channel_id)
);

CREATE INDEX idx_subscriptions_channel ON subscriptions (channel_id, created_at DESC);
CREATE INDEX idx_subscriptions_subscriber ON subscriptions (subscriber_id, created_at DESC);

-- ============================================
-- FOLLOWS (social graph for tweets)
-- ============================================
CREATE TABLE follows (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);

CREATE INDEX idx_follows_followee ON follows (followee_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows (follower_id, created_at DESC);

-- ============================================
-- PLAYLISTS
-- ============================================
CREATE TABLE playlists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(500),
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playlists_owner ON playlists (owner_id, created_at DESC);
CREATE INDEX idx_playlists_public ON playlists (is_public, created_at DESC);

-- ============================================
-- PLAYLIST_VIDEOS (join table with ordering)
-- ============================================
CREATE TABLE playlist_videos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id     UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    position        INT NOT NULL DEFAULT 0,
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (playlist_id, video_id)
);

CREATE INDEX idx_playlist_videos_playlist ON playlist_videos (playlist_id, position);

-- ============================================
-- WATCH_HISTORY
-- ============================================
CREATE TABLE watch_history (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id            UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    watched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    playback_timestamp  DOUBLE PRECISION NOT NULL DEFAULT 0,
    video_duration      DOUBLE PRECISION NOT NULL DEFAULT 0,
    UNIQUE (user_id, video_id)
);

CREATE INDEX idx_watch_history_user ON watch_history (user_id, watched_at DESC);

-- ============================================
-- WATCH_LATER
-- ============================================
CREATE TABLE watch_later (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id        UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remind_at       TIMESTAMPTZ,
    UNIQUE (user_id, video_id)
);

CREATE INDEX idx_watch_later_user ON watch_later (user_id, added_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'subscribe', 'follow', 'upload', 'system')),
    message         VARCHAR(500) NOT NULL,
    link            TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    entity_type     VARCHAR(10) CHECK (entity_type IN ('Video', 'Comment', 'Tweet', 'User')),
    entity_id       UUID,
    metadata        JSONB DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications (recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_recipient_type ON notifications (recipient_id, type, created_at DESC);

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN (
        'video_watch', 'video_upload', 'video_like', 'video_unlike',
        'comment_add', 'comment_like',
        'tweet_create', 'tweet_like', 'tweet_unlike',
        'subscription_add', 'subscription_remove',
        'playlist_create', 'playlist_add_video',
        'watchlater_add', 'profile_update', 'login'
    )),
    entity_type     VARCHAR(10) CHECK (entity_type IN ('Video', 'Comment', 'Tweet', 'User', 'Playlist')),
    entity_id       UUID,
    metadata        JSONB DEFAULT '{}'::jsonb,
    session_id      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities (user_id, created_at DESC);
CREATE INDEX idx_activities_user_type ON activities (user_id, type, created_at DESC);
CREATE INDEX idx_activities_created_at ON activities (created_at DESC);

-- ============================================
-- Auto-update updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-update trigger to tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tweets_updated_at BEFORE UPDATE ON tweets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
