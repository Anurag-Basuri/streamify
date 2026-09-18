<div align="center">

# 🎬 Streamify

### Enterprise-Grade Full-Stack Video Streaming & Social Community Platform

[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%28Neon%29-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Swagger](https://img.shields.io/badge/OpenAPI-Swagger--UI-85EA2D?logo=swagger&logoColor=black)](http://localhost:8000/swagger-ui.html)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Streamify** is a production-grade, distributed video streaming and creator social media platform. Designed for high throughput and fault-tolerant concurrency, Streamify leverages **Java 21 virtual threads (Project Loom)**, a modular **Spring Boot** architecture, **PostgreSQL (Neon Serverless)** with GIN full-text search triggers, **Redis** caching, and a responsive **React + Vite** frontend.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Database Schema](#-database-schema) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🏗️ System Architecture](#-system-architecture)
- [💾 Database Design & Schema](#-database-design--schema)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Run with Docker Compose](#3-run-with-docker-compose-recommended)
  - [4. Run for Local Development](#4-run-for-local-development)
- [⚙️ Configuration Reference](#-configuration-reference)
  - [Spring Boot Backend (`application.yml`)](#spring-boot-backend-applicationyml)
  - [React Frontend (`.env`)](#react-frontend-env)
- [📚 API Reference & Endpoints](#-api-reference--endpoints)
  - [Interactive OpenAPI / Swagger UI](#interactive-openapi--swagger-ui)
  - [Core REST Endpoints Matrix](#core-rest-endpoints-matrix)
- [📂 Project Structure](#-project-structure)
- [🛡️ Security & Performance](#-security--performance)
- [❓ Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎥 Video Streaming & Processing
- **High-Performance Uploads**: Resumable multipart video uploads (up to 2GB) backed by Cloudinary CDN.
- **FFmpeg Integration**: Server-side metadata probing, duration calculation, and frame extraction for dynamic thumbnails.
- **Instant Video Delivery**: Global CDN streaming with custom playback controls, volume memory, and playback speeds.
- **Full-Text & Trigram Search**: Automated PostgreSQL `tsvector` weighted search (`A` title, `B` description, `C` tags) and `pg_trgm` fuzzy matching.
- **View Counting & Engagement Metrics**: Deduplicated view tracking, recommendation ranking algorithms, and soft deletion.

### 👤 Identity & Access Management (IAM)
- **Spring Security 6 Architecture**: Stateless JWT authentication with dual tokens (15-min Access Token, 7-day Refresh Token).
- **Secure Cookie Strategy**: Tokens delivered via `HttpOnly`, `Secure`, `SameSite=None` cookies alongside JSON payloads.
- **Google OAuth 2.0**: Native Google ID Token cryptographic verification for instant sign-in.
- **Account Verification & Recovery**: Automated transactional HTML emails for email verification and password reset links via Spring Mail & SMTP.
- **Channel Profiles**: Custom channel handles (`/c/:username`), banner cover art, custom avatars, and bio updates.

### 💬 Community & Social Interactions
- **Channel Subscriptions**: Instant channel subscribing/unsubscribing with subscriber count aggregations.
- **Social Graph (Followers/Following)**: User follow relationships powering custom community post feeds.
- **Community Posts (Tweets)**: Text and media updates published directly to subscriber community feeds.
- **Threaded Commenting Engine**: Self-referencing recursive comments with replies, creator pinned comments, and creator hearts.
- **Polymorphic Like System**: Unified like/unlike functionality across Videos, Comments, and Community Tweets with instant count updates.

### 📚 Personal Library & Engagement
- **Watch History with Resume**: Tracks playback timestamps (`playbackTimestamp`) and progress percentages to resume videos exactly where you left off.
- **Watch Later Queue**: Save videos with custom scheduled reminder timestamps (`remind_at`) and batch management.
- **Custom Playlists**: Create public or private playlists, reorder video positions (`position`), and manage collections.
- **Liked Videos**: Centralized library of all liked media with instant toggle controls.

### 📊 Creator Studio & Real-Time Notifications
- **Creator Dashboard**: Real-time channel analytics including total video views, subscriber counts, total likes, and upload stats.
- **Real-Time Notification Hub**: Netty-SocketIO integration pushing instant in-app alerts on likes, comments, subscriptions, and new uploads.
- **Auditing & Activity Logs**: Comprehensive user action logs tracking viewing, liking, commenting, and security events.

---

## 🛠️ Tech Stack

### Backend (Spring Boot 4)

| Technology | Version | Description |
| :--- | :--- | :--- |
| **Java** | 21 (LTS) | Modern Java leveraging Virtual Threads (Project Loom) |
| **Spring Boot** | 4.1.0 | Enterprise backend framework with reactive MVC |
| **Spring Security** | 6.x | Enterprise authentication, authorization, and CORS filters |
| **Spring Data JPA / Hibernate** | 7.x | High-performance ORM with PostgreSQL JSONB and Array dialect support |
| **PostgreSQL / Neon** | 16+ | Serverless relational database with ACID compliance, Trigrams, and TSVECTOR |
| **Flyway** | 10.x | Production database migrations and automated schema evolution |
| **Redis** | 7.x | High-throughput in-memory store for session caching and rate-limiting |
| **JJWT (io.jsonwebtoken)** | 0.12.6 | Cryptographic JWT creation, verification, and rotation |
| **Netty-SocketIO** | 2.0.13 | High-concurrency WebSocket server for real-time notifications |
| **Cloudinary Java SDK** | 1.39.0 | Cloud media storage, transformations, and global CDN delivery |
| **Google API Client** | 2.7.2 | Cryptographic validation of Google OAuth2 ID tokens |
| **SpringDoc OpenAPI** | 3.1.0 | Automated OpenAPI 3.0 specification and interactive Swagger UI |
| **Spring Mail** | 4.x | Transactional email delivery over secure TLS/SMTP |

### Frontend (React + Vite)

| Technology | Version | Description |
| :--- | :--- | :--- |
| **React** | 18.3.1 | Declarative component UI library with modern Hooks |
| **Vite** | 6.0.1 | Next-generation fast frontend build tool and dev server |
| **Tailwind CSS** | 3.4.16 | Utility-first styling with custom dark/light theme tokens |
| **Framer Motion** | 12.6.2 | Smooth micro-animations, modal transitions, and spring physics |
| **React Router** | 7.1.x | Client-side routing with nested layouts and protected route guards |
| **Axios** | 1.9.0 | HTTP client with automatic refresh-token interception |
| **Socket.IO Client** | 4.8.3 | Real-time WebSocket connection to Spring SocketIO service |
| **Heroicons & Lucide** | Latest | Modern, clean vector iconography |
| **React Hot Toast** | 2.5.2 | Accessible, lightweight notification popups |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT LAYER                                 │
│                   ┌──────────────┐       ┌──────────────┐                   │
│                   │ Web Browser  │       │Mobile Browser│                   │
│                   └──────┬───────┘       └──────┬───────┘                   │
└──────────────────────────┼──────────────────────┼───────────────────────────┘
                           │                      │
                           ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ⚛️ FRONTEND APPLICATION (React + Vite)                   │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │ AppRoutes    │  │ Contexts    │  │ CustomHooks │  │ Axios Client      │  │
│  │ (Protected)  │  │ (Auth/Theme)│  │ (useVideos) │  │ (Token Intercept) │  │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬─────────┘  │
└─────────┼─────────────────┼────────────────┼───────────────────┼────────────┘
          │                 │                │                   │
          │ REST (Port 8000)│                │ WebSocket (8085)  │
          ▼                 ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🚀 BACKEND APPLICATION (Spring Boot 4)                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Security Filter Chain: JwtAuthenticationFilter & CorsConfig           │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────────────┐        ▼       ┌───────────────────────────┐  │
│  │ Modular REST Controllers │◄───────────────┤ Virtual Thread Pool (Loom)│  │
│  │ (User, Video, Comment,   │                └───────────────────────────┘  │
│  │  Tweet, Subscription...) │                                               │
│  └─────────────┬────────────┘                                               │
│                │                                                            │
│                ▼                                                            │
│  ┌──────────────────────────┐                ┌───────────────────────────┐  │
│  │ Transactional Services   ├───────────────►│ Netty-SocketIO Server     │  │
│  │ & Business Domain Logic  │                │ (Real-Time Notifications) │  │
│  └─────────────┬────────────┘                └───────────────────────────┘  │
│                │                                                            │
│                ▼                                                            │
│  ┌──────────────────────────┐                ┌───────────────────────────┐  │
│  │ Spring Data JPA Repos    ├───────────────►│ Flyway Schema Migrations  │  │
│  └──────┬────────────────┬──┘                └───────────────────────────┘  │
└─────────┼────────────────┼──────────────────────────────────────────────────┘
          │ SQL Queries    │ Cache & PubSub
          ▼                ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────────────┐
│  🐘 PostgreSQL   │  │    🔴 Redis 7    │  │     ☁️ Cloudinary & SMTP        │
│ (Neon Serverless │  │  (Session Cache, │  │   (Video Streaming CDN,         │
│  UUID, GIN, TS)  │  │   Rate Limiting) │  │    Transactional Email)         │
└──────────────────┘  └──────────────────┘  └─────────────────────────────────┘
```

---

## 💾 Database Design & Schema

Streamify uses a fully relational schema managed by **Flyway** in PostgreSQL (`db/migration/V1__init_schema.sql`). It utilizes native `UUID` primary keys (`uuid-ossp`), trigram indexes (`pg_trgm`) for fuzzy user matching, `JSONB` for granular notification settings, and PostgreSQL automated `TSVECTOR` triggers for full-text search.

```
                      ┌───────────────────┐
                      │       USERS       │
                      └─┬───────┬───────┬─┘
         ┌──────────────┘       │       └──────────────┐
         ▼ 1:N                  ▼ 1:N                  ▼ 1:N
   ┌───────────┐          ┌───────────┐          ┌───────────────┐
   │  VIDEOS   │          │  TWEETS   │          │ SUBSCRIPTIONS │
   └─┬───────┬─┘          └─────┬─────┘          └───────────────┘
     │       │                  │
 1:N │       │ 1:N              │ 1:N
     ▼       ▼                  ▼
┌──────────┐ ┌───────────────────────┐
│ WATCH    │ │       COMMENTS        │◄──┐ (Self-Referential
│ HISTORY  │ │ (Polymorphic:         │───┘  Parent Replies)
└──────────┘ │  Video / Tweet)       │
             └───────────┬───────────┘
                         │ 1:N
                         ▼
             ┌───────────────────────┐
             │         LIKES         │
             │ (Polymorphic: Video,  │
             │  Tweet, Comment)      │
             └───────────────────────┘
```

### Relational Tables Summary

| Table | Primary Key | Key Relationships / Features | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `UUID` | Unique email & username, `jsonb` notification prefs | User identities, auth tokens, channel profiles |
| `videos` | `UUID` | FK `owner_id` -> `users`, GIN `search_vector` | Video metadata, Cloudinary media URLs, views, tags |
| `tweets` | `UUID` | FK `owner_id` -> `users` | Community text posts for channel subscribers |
| `comments` | `UUID` | FK `owner_id`, FK `parent_id` (self), polymorphic entity | Threaded comments on Videos and Tweets |
| `comment_hearts` | `UUID` | FK `comment_id`, FK `user_id` (Unique pair) | Creator heart recognition on comments |
| `likes` | `UUID` | FK `liked_by`, polymorphic (`Video`, `Tweet`, `Comment`) | Unified like registry with unique constraints |
| `subscriptions` | `UUID` | FK `subscriber_id`, FK `channel_id` (Unique pair) | Channel subscriber relationships |
| `follows` | `UUID` | FK `follower_id`, FK `followee_id` (Unique pair) | User social following graph |
| `playlists` | `UUID` | FK `owner_id` -> `users`, `is_public` flag | Custom video playlists |
| `playlist_videos`| `UUID` | FK `playlist_id`, FK `video_id`, `position` INT | Ordered join table for playlist entries |
| `watch_history` | `UUID` | FK `user_id`, FK `video_id`, `playback_timestamp` | Resumable playback history per user |
| `watch_later` | `UUID` | FK `user_id`, FK `video_id`, `remind_at` | Saved videos queue with reminder timestamps |
| `notifications` | `UUID` | FK `recipient_id`, FK `sender_id`, `type`, `metadata` | In-app alerts delivered via WebSockets |
| `activities` | `UUID` | FK `user_id`, `type`, `metadata` JSONB | Comprehensive audit trail of actions |

---

## 🚀 Quick Start & Installation

### Prerequisites

| Requirement | Minimum Version | Verify Command |
| :--- | :--- | :--- |
| **Java JDK** | 21+ | `java -version` |
| **Maven** | 3.9+ (or use `./mvnw`) | `mvn -v` |
| **Node.js** | 18.x or 20.x | `node -v` |
| **npm** | 9.x or 10.x | `npm -v` |
| **PostgreSQL** | 15+ (or Neon Serverless) | `psql --version` |
| **Redis** | 6+ or 7+ | `redis-cli ping` |
| **Docker** (Optional) | 24+ | `docker --version` |

---

### 1. Clone Repository

```bash
git clone https://github.com/Anurag-Basuri/streamify.git
cd streamify
```

---

### 2. Environment Configuration

#### A. Spring Boot Backend Configuration
You can pass environment variables directly or configure `apps/backend-spring/src/main/resources/application.yml`. Create an `.env` or set environment variables in your terminal:

```env
# Server
PORT=8000

# PostgreSQL (Neon or Local)
DATABASE_URL=jdbc:postgresql://ep-example-pooler.region.neon.tech/streamify?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your_neon_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security & JWT (Generate secure random 32+ character strings)
ACCESS_TOKEN_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
REFRESH_TOKEN_SECRET=586E3272357538782F413F4428472B4B6250645367566B597033733676397924

# Cloudinary Media
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# SMTP Mail Server (Gmail or SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=Streamify <noreply@streamify.com>

# CORS & URLs
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
SOCKETIO_PORT=8085
```

#### B. React Frontend Configuration
Create `apps/frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

### 3. Run with Docker Compose (Recommended)

Start the entire stack (PostgreSQL, Redis, Spring Boot Backend, and React Frontend) with a single command:

```bash
docker compose up -d
```

| Container | Internal Port | Host Port | Description |
| :--- | :--- | :--- | :--- |
| `streamify-frontend` | 80 | `http://localhost:80` | Nginx serving built React app |
| `streamify-backend` | 8080 | `http://localhost:8080` | Spring Boot 4 REST API |
| `streamify-backend` | 8085 | `http://localhost:8085` | Netty-SocketIO WebSocket |
| `streamify-postgres` | 5432 | `localhost:5432` | PostgreSQL 16 Alpine |
| `streamify-redis` | 6379 | `localhost:6379` | Redis 7 Alpine |

To view logs:
```bash
docker compose logs -f backend
```

---

### 4. Run for Local Development

#### Terminal 1: Run PostgreSQL & Redis (if using Docker for databases)
```bash
docker run -d --name streamify-pg -p 5432:5432 -e POSTGRES_DB=streamify -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:16-alpine
docker run -d --name streamify-redis -p 6379:6379 redis:7-alpine
```

#### Terminal 2: Start Spring Boot Backend
```bash
cd apps/backend-spring

# Linux / macOS
./mvnw clean spring-boot:run

# Windows (PowerShell / CMD)
.\mvnw.cmd clean spring-boot:run
```
> The backend will start on **`http://localhost:8000`**. Flyway will automatically execute database migrations on startup.

#### Terminal 3: Start React Frontend
```bash
cd apps/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend will be accessible at **`http://localhost:5173`**.

---

## ⚙️ Configuration Reference

### Spring Boot Backend (`application.yml`)

The application is configured through `apps/backend-spring/src/main/resources/application.yml` and accepts standard environment variable overrides:

| Configuration Property | Environment Variable | Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `server.port` | `PORT` | `8000` | HTTP port for REST API |
| `spring.threads.virtual.enabled` | — | `true` | Enables Java 21 Project Loom virtual threads |
| `spring.datasource.url` | `DATABASE_URL` | `jdbc:postgresql://localhost:5432/streamify` | JDBC PostgreSQL connection string |
| `spring.datasource.username` | `DATABASE_USERNAME` | `postgres` | Database username |
| `spring.datasource.password` | `DATABASE_PASSWORD` | `postgres` | Database password |
| `spring.data.redis.host` | `REDIS_HOST` | `localhost` | Redis server hostname |
| `spring.data.redis.port` | `REDIS_PORT` | `6379` | Redis server port |
| `app.cors.allowed-origins` | `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origins for frontend |
| `app.jwt.access-token-secret` | `ACCESS_TOKEN_SECRET` | Min 32 chars | Secret key for signing Access Tokens |
| `app.jwt.refresh-token-secret`| `REFRESH_TOKEN_SECRET`| Min 32 chars | Secret key for signing Refresh Tokens |
| `app.jwt.access-token-expiry-ms` | — | `900000` (15m) | Access token lifespan in milliseconds |
| `app.jwt.refresh-token-expiry-ms`| — | `604800000` (7d) | Refresh token lifespan in milliseconds |
| `app.cloudinary.cloud-name` | `CLOUD_NAME` | — | Cloudinary cloud identifier |
| `app.cloudinary.api-key` | `API_KEY` | — | Cloudinary API Key |
| `app.cloudinary.api-secret` | `API_SECRET` | — | Cloudinary API Secret |
| `app.google.client-id` | `GOOGLE_CLIENT_ID` | — | Google Cloud OAuth 2.0 Web Client ID |
| `app.socketio.port` | `SOCKETIO_PORT` | `8085` | Netty-SocketIO real-time event server port |
| `springdoc.swagger-ui.path` | — | `/swagger-ui.html` | Swagger UI documentation route |

### React Frontend (`.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Spring Boot REST API | `http://localhost:8000` |

---

## 📚 API Reference & Endpoints

### Interactive OpenAPI / Swagger UI

Streamify includes comprehensive OpenAPI 3.0 documentation generated automatically by `springdoc-openapi`. When the backend is running, test endpoints interactively at:

- **Swagger UI**: [http://localhost:8000/swagger-ui.html](http://localhost:8000/swagger-ui.html)
- **OpenAPI 3.0 Spec**: [http://localhost:8000/v3/api-docs](http://localhost:8000/v3/api-docs)
- **Actuator Health**: [http://localhost:8000/actuator/health](http://localhost:8000/actuator/health)

```
Standard API Envelope:
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success",
  "success": true
}
```

### Core REST Endpoints Matrix

#### 🔐 Authentication & Profile (`/api/v1/users`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/users/register` | ❌ | Register a new user account |
| `POST` | `/api/v1/users/login` | ❌ | Authenticate via username/email & password |
| `POST` | `/api/v1/users/auth/google` | ❌ | Sign in or sign up via Google ID Token |
| `GET` | `/api/v1/users/auth/google/client-id` | ❌ | Retrieve backend Google OAuth client ID |
| `POST` | `/api/v1/users/refresh-token` | ❌ | Exchange refresh token cookie for new access token |
| `POST` | `/api/v1/users/logout` | ✅ | Revoke refresh token and clear auth cookies |
| `GET` | `/api/v1/users/me` | ✅ | Get profile of currently authenticated user |
| `PATCH`| `/api/v1/users/me` | ✅ | Update user full name, bio, and details |
| `PATCH`| `/api/v1/users/change-password` | ✅ | Change user password |
| `POST` | `/api/v1/users/forgot-password` | ❌ | Request email password reset link |
| `POST` | `/api/v1/users/reset-password/{token}` | ❌ | Reset password using emailed token |
| `GET` | `/api/v1/users/verify-email/{token}` | ❌ | Verify email address |
| `POST` | `/api/v1/users/resend-verification` | ✅ | Resend email verification link |
| `GET` | `/api/v1/users/c/{username}` | ❌ | Get public channel profile by username |
| `PATCH`| `/api/v1/users/change-avatar` | ✅ | Upload new profile avatar (multipart) |
| `PATCH`| `/api/v1/users/change-cover-image` | ✅ | Upload new channel banner cover (multipart) |

#### 🎥 Video Management (`/api/v1/videos`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/videos` (or `/upload`) | ✅ | Upload and publish video with thumbnail (multipart) |
| `GET` | `/api/v1/videos` | ❌ | Get paginated feed of published videos |
| `GET` | `/api/v1/videos/search?query=...` | ❌ | Full-text TSVECTOR search across videos |
| `GET` | `/api/v1/videos/{videoId}` | ❌ | Get video details, streaming URL, and creator data |
| `PATCH`| `/api/v1/videos/{videoId}` | ✅ | Update video title, description, tags, thumbnail |
| `DELETE`| `/api/v1/videos/{videoId}` | ✅ | Soft delete a video |
| `PATCH`| `/api/v1/videos/{videoId}/toggle-publish` | ✅ | Toggle public/private visibility |
| `POST` | `/api/v1/videos/{videoId}/views` | ❌ | Increment video view count |
| `GET` | `/api/v1/videos/recommendations/{videoId}` | ❌ | Get content-based recommended videos |
| `GET` | `/api/v1/videos/user/{userId}` | ❌ | Get all videos published by a specific channel |

#### 💬 Comments & Replies (`/api/v1/comments`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/comments/{entityType}/{entityId}` | ✅ | Add comment to Video or Tweet |
| `GET` | `/api/v1/comments/{entityType}/{entityId}` | ❌ | Fetch paginated comments for an entity |
| `GET` | `/api/v1/comments/{commentId}/replies` | ❌ | Get nested replies to a comment |
| `PATCH`| `/api/v1/comments/{commentId}` | ✅ | Edit an existing comment |
| `DELETE`| `/api/v1/comments/{commentId}` | ✅ | Delete a comment |
| `PATCH`| `/api/v1/comments/{commentId}/pin` | ✅ | Pin/unpin a comment (content creator only) |

#### ❤️ Likes (`/api/v1/likes`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/likes/{entityType}/{entityId}` | ✅ | Toggle like on Video, Tweet, or Comment |
| `GET` | `/api/v1/likes/{entityType}/{entityId}/status` | ✅ | Check user like status and get likes count |
| `POST` | `/api/v1/likes/toggle/v/{videoId}` | ✅ | Shorthand: Toggle like on video |
| `POST` | `/api/v1/likes/toggle/c/{commentId}` | ✅ | Shorthand: Toggle like on comment |
| `POST` | `/api/v1/likes/toggle/t/{tweetId}` | ✅ | Shorthand: Toggle like on tweet |
| `GET` | `/api/v1/likes/videos` | ✅ | Get all liked videos for current user |

#### 🔔 Subscriptions & Follows (`/api/v1/subscriptions` & `/api/v1/follows`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/subscriptions/{channelId}` | ✅ | Subscribe or unsubscribe to a channel |
| `GET` | `/api/v1/subscriptions/{channelId}/subscribers` | ❌ | Get list of subscribers for a channel |
| `GET` | `/api/v1/subscriptions/me` | ✅ | Get all channels current user is subscribed to |
| `GET` | `/api/v1/subscriptions/check/{channelId}` | ✅ | Check if user is subscribed to channel |
| `POST` | `/api/v1/follows/{followeeId}` | ✅ | Follow or unfollow a user |
| `GET` | `/api/v1/follows/{userId}/followers` | ❌ | Get user's followers |
| `GET` | `/api/v1/follows/{userId}/following` | ❌ | Get users followed by user |
| `GET` | `/api/v1/follows/check/{followeeId}` | ✅ | Check if user is following target user |

#### 🐦 Community Tweets (`/api/v1/tweets`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/tweets` | ✅ | Create community text update |
| `GET` | `/api/v1/tweets` | ❌ | Get community feed with like status |
| `GET` | `/api/v1/tweets/{userId}` | ❌ | Get tweets by channel owner |
| `PATCH`| `/api/v1/tweets/{tweetId}` | ✅ | Update tweet content |
| `DELETE`| `/api/v1/tweets/{tweetId}` | ✅ | Delete tweet |

#### 📑 Playlists (`/api/v1/playlists`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/playlists` | ✅ | Create new playlist (public or private) |
| `GET` | `/api/v1/playlists/{playlistId}` | ❌ | Get playlist metadata and ordered video list |
| `GET` | `/api/v1/playlists/user/{userId}` | ❌ | Get playlists created by a user |
| `PATCH`| `/api/v1/playlists/{playlistId}` | ✅ | Update playlist title and description |
| `DELETE`| `/api/v1/playlists/{playlistId}` | ✅ | Delete playlist |
| `POST` | `/api/v1/playlists/{playlistId}/videos/{videoId}` | ✅ | Add video to playlist |
| `DELETE`| `/api/v1/playlists/{playlistId}/videos/{videoId}` | ✅ | Remove video from playlist |

#### 🕒 History & Watch Later (`/api/v1/history` & `/api/v1/watch-later`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/history/{videoId}` | ✅ | Upsert video watch history with playback timestamp |
| `GET` | `/api/v1/history` | ✅ | Get chronological watch history |
| `DELETE`| `/api/v1/history` | ✅ | Clear entire watch history |
| `GET` | `/api/v1/history/stats` | ✅ | Get total watched videos statistics |
| `POST` | `/api/v1/watch-later/{videoId}` | ✅ | Toggle video in Watch Later list |
| `GET` | `/api/v1/watch-later` | ✅ | Get saved Watch Later queue |
| `DELETE`| `/api/v1/watch-later/clear` | ✅ | Clear Watch Later list |
| `GET` | `/api/v1/watch-later/stats` | ✅ | Get total saved count in Watch Later |

#### 🔔 Notifications, Activities & Dashboard
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/notifications` | ✅ | Get paginated user notifications |
| `GET` | `/api/v1/notifications/unread-count` | ✅ | Get count of unread notifications |
| `PATCH`| `/api/v1/notifications/{id}/read` | ✅ | Mark notification as read |
| `PATCH`| `/api/v1/notifications/read-all` | ✅ | Mark all notifications as read |
| `GET` | `/api/v1/activity` | ✅ | Paginated audit log of user activities |
| `GET` | `/api/v1/activity/summary` | ✅ | Aggregated summary of activities over N days |
| `GET` | `/api/v1/dashboard/stats` | ✅ | Creator channel stats (views, subscribers, likes) |
| `GET` | `/api/v1/dashboard/videos` | ✅ | Creator video management list |

---

## 📂 Project Structure

```
streamify/
├── apps/
│   ├── backend-spring/                 # 🚀 Java 21 Spring Boot 4 Backend Application
│   │   ├── pom.xml                     # Maven build definition & dependencies
│   │   ├── Dockerfile                  # Multi-stage JDK build Dockerfile
│   │   ├── mvnw / mvnw.cmd             # Maven Wrapper scripts
│   │   └── src/
│   │       └── main/
│   │           ├── java/com/streamify/
│   │           │   ├── StreamifyApplication.java     # Spring Boot application entry point
│   │           │   │
│   │           │   ├── common/                       # Shared API envelopes & pagination
│   │           │   │   ├── ApiResponse.java          # Uniform response record wrapper
│   │           │   │   ├── PageResponse.java         # Paginated response wrapper
│   │           │   │   └── GlobalExceptionHandler.java # Centralized @ControllerAdvice
│   │           │   │
│   │           │   ├── config/                       # Spring framework configurations
│   │           │   │   ├── AppConfig.java            # Jackson, task executor, virtual threads
│   │           │   │   ├── CorsConfig.java           # Cross-Origin resource sharing policy
│   │           │   │   ├── SecurityConfig.java       # Spring Security 6 filter chain
│   │           │   │   └── CloudinaryConfig.java     # Cloudinary media storage bean
│   │           │   │
│   │           │   ├── security/                     # Authentication & JWT layer
│   │           │   │   ├── JwtTokenProvider.java     # JJWT signing, validation, refresh
│   │           │   │   ├── JwtAuthenticationFilter.java # Per-request Bearer/Cookie extractor
│   │           │   │   └── UserPrincipal.java        # Spring Security UserDetails representation
│   │           │   │
│   │           │   ├── infrastructure/               # External service adapters
│   │           │   │   ├── media/CloudinaryService.java # Image/Video uploads & deletes
│   │           │   │   ├── mail/EmailService.java    # SMTP verification/reset emails
│   │           │   │   └── socket/SocketIOService.java # Netty-SocketIO real-time pusher
│   │           │   │
│   │           │   └── modules/                      # Domain Modules (Clean Architecture)
│   │           │       ├── activity/                 # Audit logging & activity stats
│   │           │       ├── comment/                  # Threaded comments, replies, hearts, pins
│   │           │       ├── dashboard/                # Channel analytics & creator stats
│   │           │       ├── follow/                   # User follow/following graph
│   │           │       ├── history/                  # Watch history with playback resume
│   │           │       ├── like/                     # Polymorphic likes (Video/Tweet/Comment)
│   │           │       ├── notification/             # In-app notifications & preferences
│   │           │       ├── playlist/                 # Playlists with ordered video positions
│   │           │       ├── subscription/             # Channel subscriptions & subscriber feed
│   │           │       ├── tweet/                    # Community text posts & feed
│   │           │       ├── upload/                   # Generic media upload endpoint
│   │           │       ├── user/                     # Authentication, profiles, Google OAuth
│   │           │       ├── video/                    # Video CRUD, TSVECTOR search, feed
│   │           │       └── watchlater/               # Watch Later queue with reminders
│   │           │
│   │           └── resources/
│   │               ├── application.yml               # Comprehensive Spring Boot configuration
│   │               └── db/migration/
│   │                   └── V1__init_schema.sql       # PostgreSQL Flyway schema migration
│   │
│   └── frontend/                       # ⚛️ React 18 + Vite Frontend Application
│       ├── package.json                # Dependencies, Vite, Tailwind, Framer Motion
│       ├── vite.config.js              # Vite bundler configuration & proxies
│       ├── tailwind.config.js          # Tailwind CSS theme extension
│       └── src/
│           ├── main.jsx                # Application root mounting
│           ├── App.jsx                 # App layout, theme providers, toast setup
│           │
│           ├── routes/                 # Client routes
│           │   ├── AppRoutes.jsx       # Lazy-loaded route map
│           │   └── ProtectedRoute.jsx  # Authentication gatekeeper
│           │
│           ├── context/                # Global React state
│           │   ├── AuthContext.jsx     # Current user state, login, logout, refresh
│           │   └── ThemeContext.jsx    # Dark/Light theme toggle
│           │
│           ├── services/               # Modular Axios API clients
│           │   ├── api.js              # Axios instance with cookie credentials & 401 interceptor
│           │   ├── authService.js      # Auth, register, Google login, profile calls
│           │   ├── videoService.js     # Video upload, feeds, search, detail calls
│           │   ├── commentService.js   # Threaded comment CRUD & replies
│           │   ├── likeService.js      # Like toggles & liked videos list
│           │   ├── subscriptionService.js # Channel subscriptions
│           │   ├── tweetService.js     # Community tweets
│           │   ├── historyService.js   # Watch history tracking & playback timestamps
│           │   └── notificationService.js # In-app notification polling & read actions
│           │
│           ├── pages/                  # Page-level components
│           │   ├── Display/            # Home feed, Channel view, Search, Subscriptions
│           │   ├── Account/            # History, WatchLater, LikedVideos, Dashboard, Playlists
│           │   └── You/                # Sign In/Up, Google OAuth, Profile, Forgot Password
│           │
│           └── components/             # Reusable UI components
│               ├── Header.jsx          # Search bar, notifications dropdown, user avatar
│               ├── Sidebar.jsx         # Collapsible navigation drawer
│               ├── Video/              # VideoPlayer, VideoCard, VideoGrid
│               ├── Form/               # Form inputs, password strength meter
│               └── Modal.jsx           # Accessible dialog modals
│
├── docker-compose.yml                  # Base production/staging Docker Compose
├── docker-compose.dev.yml              # Local development overrides
├── Makefile                            # Convenience CLI automation commands
├── LICENSE                             # MIT Open Source License
└── README.md                           # Documentation
```

---

## 🛡️ Security & Performance

### Enterprise Security Features
- **BCrypt Password Hashing**: Password hashes are salted and computed with a cost factor of 12 (`new BCryptPasswordEncoder(12)`).
- **Dual-Token JWT Authentication**: 
  - Short-lived Access Token (15 minutes) minimizes exposure window.
  - Long-lived Refresh Token (7 days) with rotation and single-session revocation stored in Redis.
- **CSRF & Cookie Protection**: Session tokens are transmitted as `HttpOnly`, `Secure` cookies with `SameSite=None` to prevent Cross-Site Scripting (XSS) extraction while allowing authenticated Cross-Origin requests.
- **Strict HTTP Security Headers**: Frame Options set to `DENY` to defeat clickjacking; Content-Security-Policy (CSP) headers enabled.
- **Input Sanitization & Validation**: Jakarta Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`) enforces input constraints on every incoming DTO.

### High-Performance Optimizations
- **Java 21 Virtual Threads (Project Loom)**: Enabled via `spring.threads.virtual.enabled: true`. Each incoming request executes on a lightweight virtual thread, enabling thousands of concurrent I/O operations with minimal memory overhead.
- **PostgreSQL Full-Text Trigram & TSVECTOR Indexes**: Automatic trigger updates `search_vector` on video mutations, providing sub-millisecond full-text search without requiring an external Elasticsearch cluster.
- **HikariCP Connection Pool**: Tuned connection pool (`maximum-pool-size: 10`, `connection-timeout: 20s`) optimized for serverless PostgreSQL connection pooling on Neon.
- **Vite & Code Splitting**: Frontend routes are loaded lazily (`React.lazy`) with chunking to ensure rapid First Contentful Paint (FCP).

---

## ❓ Troubleshooting

<details>
<summary><b>🐘 PostgreSQL / Neon Connection Refused or SSL Error</b></summary>

- If connecting to Neon Serverless PostgreSQL, ensure your connection string includes `?sslmode=require`.
  ```env
  DATABASE_URL=jdbc:postgresql://ep-your-branch.region.neon.tech/streamify?sslmode=require
  ```
- If running locally via Docker, verify PostgreSQL is healthy: `docker ps` and check port `5432`.
- Check that username and password match your database credentials.
</details>

<details>
<summary><b>☁️ Cloudinary Upload Errors ("Must supply api_key")</b></summary>

- Verify `CLOUD_NAME`, `API_KEY`, and `API_SECRET` are supplied in your environment or `application.yml`.
- Ensure the API Key does not contain accidental leading/trailing whitespace.
- Check Cloudinary Dashboard to confirm your account status is active and quotas are not exceeded.
</details>

<details>
<summary><b>📧 Email Verification Not Sending (SMTP Authentication Failed)</b></summary>

- For Gmail SMTP (`smtp.gmail.com:587`), standard Gmail passwords cannot be used. You must generate a 16-character **App Password** from [Google Account Security](https://myaccount.google.com/security) with 2-Step Verification enabled.
- Set `SMTP_USER=your-email@gmail.com` and `SMTP_PASS=your-16-char-app-password`.
</details>

<details>
<summary><b>🌐 CORS Errors on Frontend Requests</b></summary>

- Ensure `CORS_ORIGIN` in the backend environment matches your frontend URL (default: `http://localhost:5173`).
- If you run the frontend on a different port or custom domain, update `app.cors.allowed-origins` in `application.yml` or the `CORS_ORIGIN` environment variable.
</details>

<details>
<summary><b>🔴 Redis Connection Issues</b></summary>

- If Redis is running on a custom port or remote server, update `REDIS_HOST` and `REDIS_PORT`.
- To quickly run Redis in Docker:
  ```bash
  docker run -d --name streamify-redis -p 6379:6379 redis:7-alpine
  ```
</details>

---

## 🗺️ Roadmap

- [x] Complete Java 21 & Spring Boot 4 architectural migration
- [x] PostgreSQL schema with Flyway, GIN trigram, and TSVECTOR search
- [x] JWT Dual-Token authentication and Google OAuth2 ID token verification
- [x] Threaded comments with parent-reply hierarchies and creator hearts
- [x] Channel subscriptions and social follower graph
- [x] Community text updates (Tweets)
- [x] Resumable watch history with playback timestamp resumption
- [x] Watch Later queue with reminder scheduling
- [x] OpenAPI 3.0 and interactive Swagger UI
- [ ] Adaptive Bitrate Streaming (HLS / DASH transcoding pipeline)
- [ ] Live Streaming with WebRTC / RTMP ingestion
- [ ] AI-Powered automatic subtitle and transcript generation (Whisper API)
- [ ] Creator Monetization (Stripe memberships and Super Chat)

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'feat: Add amazing new feature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Commit Conventions
- `feat:` New feature or capability
- `fix:` Bug fix
- `docs:` Documentation updates
- `style:` Code style, formatting, missing semicolons
- `refactor:` Code refactoring without changing behavior
- `perf:` Performance optimizations
- `test:` Adding or updating tests
- `chore:` Maintenance, build configurations, dependencies

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 👤 Author

**Anurag Basuri**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Anurag-Basuri)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Crafted with high-performance Java & React ☕

</div>
