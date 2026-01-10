<div align="center">

# 🎬 Streamify

### A Modern Full-Stack Video Streaming Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Streamify** is a production-ready video streaming platform similar to YouTube, featuring video uploads, user authentication, playlists, subscriptions, and more. Built with modern technologies and best practices.

[Features](#-features) · [Demo](#-demo) · [Installation](#-installation) · [Documentation](#-documentation) · [Contributing](#-contributing)

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎥 Video Management

| Feature              | Description                                        |
| -------------------- | -------------------------------------------------- |
| **Video Upload**     | Upload videos up to 2GB with drag-and-drop support |
| **Auto Compression** | Server-side video compression using FFmpeg         |
| **Custom Player**    | Built-in video player with playback controls       |
| **Thumbnails**       | Auto-generated or custom thumbnail upload          |
| **Publish Control**  | Publish/unpublish videos with one click            |
| **Video Editing**    | Update title, description, tags, and thumbnail     |

### 👤 User System

| Feature                | Description                               |
| ---------------------- | ----------------------------------------- |
| **Email Verification** | Secure email verification on registration |
| **Password Reset**     | Email-based password recovery             |
| **Profile Management** | Custom avatars and cover images           |
| **Channel System**     | Each user has their own channel           |
| **JWT Authentication** | Secure token-based authentication         |
| **Session Management** | Auto token refresh, graceful logout       |

### 📺 Social Features

| Feature           | Description                    |
| ----------------- | ------------------------------ |
| **Subscriptions** | Subscribe to channels you love |
| **Like/Dislike**  | React to videos                |
| **Comments**      | Comment on videos with replies |
| **Watch History** | Track your viewing history     |
| **Watch Later**   | Save videos to watch later     |
| **Playlists**     | Create and manage playlists    |

### 🛡️ Security & Performance

| Feature              | Description                            |
| -------------------- | -------------------------------------- |
| **Rate Limiting**    | Protection against brute force attacks |
| **Helmet**           | HTTP security headers                  |
| **CORS**             | Configurable cross-origin settings     |
| **Input Validation** | Express-validator for all inputs       |
| **Lazy Loading**     | React.lazy for code splitting          |
| **GZIP Compression** | Reduced response sizes                 |

---

## 🖼️ Demo

### 📸 Screenshots

<table>
<tr>
<td align="center"><strong>Home Page</strong></td>
<td align="center"><strong>Video Player</strong></td>
<td align="center"><strong>User Profile</strong></td>
</tr>
<tr>
<td><img src="frontend/public/screenshots/home.png" alt="Home Page" width="100%"/></td>
<td><img src="frontend/public/screenshots/player.png" alt="Video Player" width="100%"/></td>
<td><img src="frontend/public/screenshots/profile.png" alt="User Profile" width="100%"/></td>
</tr>
</table>

### 🎥 Live Demo

> **Live Link**: [https://streamify-demo.vercel.app](https://streamify-demo.vercel.app) (Coming Soon)

---

## ❓ Troubleshooting

<details>
<summary><b>MongoDB Connection Error</b></summary>

- Ensure your IP is whitelisted in MongoDB Atlas or allow all IPs (`0.0.0.0/0`).
- Check if `MONGODB_URL` in `.env` is correct and includes username/password.
- If password has special characters, URL encode them.
</details>

<details>
<summary><b>Cloudinary Upload Failed</b></summary>

- Verify `CLOUD_NAME`, `API_KEY`, and `API_SECRET` in `backend/.env`.
- Ensure your internet connection is stable.
- Check file size limits in `constants.js` (default 2GB for video).
</details>

<details>
<summary><b>Email Not Sending</b></summary>

- Ensure you are using an **App Password** for Gmail, not your login password.
- Check if `SMTP_HOST` and `SMTP_PORT` are correct.
- Verify `EMAIL_FROM` is a valid email address.
</details>

<details>
<summary><b>CORS Error</b></summary>

- Ensure `CORS_ORIGIN` in `backend/.env` matches your frontend URL (e.g., `http://localhost:5173`).
- If testing from a different device, ensure backend is accessible via network IP.
</details>

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Version | Purpose                 |
| ------------------- | ------- | ----------------------- |
| **React**           | 18.3    | UI library with hooks   |
| **Vite**            | 6.0     | Build tool & dev server |
| **TailwindCSS**     | 3.4     | Utility-first CSS       |
| **Framer Motion**   | 12.6    | Animations              |
| **React Router**    | 7.1     | Client-side routing     |
| **Axios**           | 1.9     | HTTP client             |
| **React Hot Toast** | 2.5     | Toast notifications     |
| **Heroicons**       | 2.2     | Icon library            |

### Backend

| Technology     | Version | Purpose             |
| -------------- | ------- | ------------------- |
| **Node.js**    | 18+     | JavaScript runtime  |
| **Express**    | 4.21    | Web framework       |
| **MongoDB**    | 7.0     | NoSQL database      |
| **Mongoose**   | 8.9     | MongoDB ODM         |
| **Cloudinary** | 2.5     | Media storage & CDN |
| **Nodemailer** | 6.9     | Email service       |
| **FFmpeg**     | -       | Video processing    |
| **JWT**        | 9.0     | Authentication      |

### DevOps & Tools

| Tool           | Purpose         |
| -------------- | --------------- |
| **ESLint**     | Code linting    |
| **Prettier**   | Code formatting |
| **Nodemon**    | Dev auto-reload |
| **Handlebars** | Email templates |

---

## 🏗️ Architecture

### System Overview

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://mermaid.ink/svg/pako:eNqFkk1uwzAMhK9CaN0cwAu3QNEuunBXchaMLNpCJVGg5CQt0ruXthM7RYFsJM6QH4aj3aCSBmQG7x54YxFG9aXvtJEqv7Zw74G2LTi6oNK3gQ7m1qMT7MLhGjQ-qNWjJdhSlzLi_GNcU7KiMt1nw-FBVbq-pUqB0ZBu4LPbffXsOz1CrJqosTVkuqMYXO7j9_B-2kY4qoP2A4kPkc17T3z0w9k_T2XYJXQHN2FyhYjnRJqsKnAJkS-odDR5KOqY9uExBHGDLpVehegEn-xFbj2i3weuDfBEuIZaTaoxT5kXwgp_yRNB9xf0zf2uxJ3aTb4N5IinxGVuQy3QapW1_mUX9pVp2r9pLxHvN-pRuF-hlfq8">
    <source media="(prefers-color-scheme: light)" srcset="https://mermaid.ink/svg/pako:eNqFkk1uwzAMhK9CaN0cwAu3QNEuunBXchaMLNpCJVGg5CQt0ruXthM7RYFsJM6QH4aj3aCSBmQG7x54YxFG9aXvtJEqv7Zw74G2LTi6oNK3gQ7m1qMT7MLhGjQ-qNWjJdhSlzLi_GNcU7KiMt1nw-FBVbq-pUqB0ZBu4LPbffXsOz1CrJqosTVkuqMYXO7j9_B-2kY4qoP2A4kPkc17T3z0w9k_T2XYJXQHN2FyhYjnRJqsKnAJkS-odDR5KOqY9uExBHGDLpVehegEn-xFbj2i3weuDfBEuIZaTaoxT5kXwgp_yRNB9xf0zf2uxJ3aTb4N5IinxGVuQy3QapW1_mUX9pVp2r9pLxHvN-pRuF-hlfq8">
    <img alt="System Architecture" src="https://mermaid.ink/svg/pako:eNqFkk1uwzAMhK9CaN0cwAu3QNEuunBXchaMLNpCJVGg5CQt0ruXthM7RYFsJM6QH4aj3aCSBmQG7x54YxFG9aXvtJEqv7Zw74G2LTi6oNK3gQ7m1qMT7MLhGjQ-qNWjJdhSlzLi_GNcU7KiMt1nw-FBVbq-pUqB0ZBu4LPbffXsOz1CrJqosTVkuqMYXO7j9_B-2kY4qoP2A4kPkc17T3z0w9k_T2XYJXQHN2FyhYjnRJqsKnAJkS-odDR5KOqY9uExBHGDLpVehegEn-xFbj2i3weuDfBEuIZaTaoxT5kXwgp_yRNB9xf0zf2uxJ3aTb4N5IinxGVuQy3QapW1_mUX9pVp2r9pLxHvN-pRuF-hlfq8">
  </picture>
</p>

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              🖥️ CLIENT LAYER                                │
│                     ┌──────────────┐  ┌──────────────┐                      │
│                     │ Web Browser  │  │Mobile Browser│                      │
│                     └──────┬───────┘  └──────┬───────┘                      │
└─────────────────────────────┼────────────────┼──────────────────────────────┘
                              │                │
                              ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ⚛️ FRONTEND (React + Vite)                           │
│  ┌─────────┐  ┌─────────────┐  ┌────────────┐  ┌───────┐  ┌──────────────┐  │
│  │ App.jsx │→ │React Router │→ │  Context   │→ │ Hooks │→ │ API Services │  │
│  └─────────┘  └─────────────┘  └────────────┘  └───────┘  └──────┬───────┘  │
└──────────────────────────────────────────────────────────────────┼──────────┘
                                                                   │ HTTP
                                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🚀 BACKEND (Node.js + Express)                         │
│  ┌─────────┐  ┌────────┐  ┌────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ Express │→ │ Routes │→ │ Middleware │→ │ Controllers │→ │   Models    │  │
│  └─────────┘  └────────┘  └────────────┘  └──────┬──────┘  └──────┬──────┘  │
└──────────────────────────────────────────────────┼───────────────┼──────────┘
                                                   │               │
                              ┌────────────────────┼───────────────┘
                              ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ☁️ EXTERNAL SERVICES                              │
│         ┌──────────────┐      ┌──────────────┐      ┌──────────────┐        │
│         │   MongoDB    │      │  Cloudinary  │      │ Email Server │        │
│         │    Atlas     │      │     CDN      │      │    (SMTP)    │        │
│         └──────────────┘      └──────────────┘      └──────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
  ┌──────────┐          ┌──────────┐          ┌────────────┐          ┌──────────┐
  │  Client  │          │   API    │          │ Middleware │          │Controller│
  └────┬─────┘          └────┬─────┘          └─────┬──────┘          └────┬─────┘
       │                     │                      │                      │
       │  HTTP Request       │                      │                      │
       │────────────────────>│                      │                      │
       │                     │                      │                      │
       │                     │  Rate Limit Check    │                      │
       │                     │─────────────────────>│                      │
       │                     │                      │                      │
       │                     │                      │  Auth Validation     │
       │                     │                      │──────────────────────>
       │                     │                      │                      │
       │                     │                      │                      │  ┌──────────┐
       │                     │                      │                      │─>│ Database │
       │                     │                      │                      │  └────┬─────┘
       │                     │                      │                      │       │
       │                     │                      │                      │<──────┘
       │                     │                      │                      │
       │                     │                      │<─────────────────────│
       │                     │<─────────────────────│                      │
       │<────────────────────│                      │                      │
       │   JSON Response     │                      │                      │
       │                     │                      │                      │
```

### Authentication Flow

```
                                    ┌─────────────────┐
                                    │ Unauthenticated │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
            ┌───────────────┐        ┌──────────────┐        ┌────────────────┐
            │   Register    │        │    Login     │        │Forgot Password │
            └───────┬───────┘        └──────┬───────┘        └───────┬────────┘
                    │                       │                        │
                    ▼                       │                        ▼
            ┌───────────────┐               │                ┌────────────────┐
            │  Email Sent   │               │                │  Reset Email   │
            └───────┬───────┘               │                └───────┬────────┘
                    │                       │                        │
                    ▼                       │                        ▼
            ┌───────────────┐               │                ┌────────────────┐
            │   Verified    │               │                │ Password Reset │
            └───────┬───────┘               │                └───────┬────────┘
                    │                       │                        │
                    └───────────┬───────────┘                        │
                                │                                    │
                                ▼                                    │
                    ┌───────────────────────┐                        │
                    │    Authenticated      │<───────────────────────┘
                    └───────────┬───────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           │           ▼
         ┌──────────────────┐   │   ┌───────────────┐
         │  Token Refresh   │   │   │    Logout     │
         └────────┬─────────┘   │   └───────┬───────┘
                  │             │           │
                  └─────────────┘           │
                                            ▼
                                ┌─────────────────┐
                                │ Unauthenticated │
                                └─────────────────┘
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command      |
| ----------- | ------- | ------------------ |
| Node.js     | 18+     | `node --version`   |
| npm         | 9+      | `npm --version`    |
| MongoDB     | 6+      | `mongod --version` |
| FFmpeg      | 4+      | `ffmpeg -version`  |
| Git         | 2+      | `git --version`    |

### Step 1: Clone Repository

```bash
git clone https://github.com/Anurag-Basuri/streamify.git
cd streamify
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Environment Setup

Create environment files in both directories (see [Configuration](#-configuration) section).

### Step 4: Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Step 5: Access Application

| Service      | URL                          |
| ------------ | ---------------------------- |
| Frontend     | http://localhost:5173        |
| Backend API  | http://localhost:8000        |
| Health Check | http://localhost:8000/health |
| API Status   | http://localhost:8000/status |

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# ═══════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════
PORT=8000
NODE_ENV=development

# ═══════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=streamify

# ═══════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════
ACCESS_TOKEN_SECRET=your_super_secret_access_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_min_32_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
SESSION_SECRET=your_session_secret

# ═══════════════════════════════════════════
# CLOUDINARY (Media Storage)
# ═══════════════════════════════════════════
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# ═══════════════════════════════════════════
# EMAIL CONFIGURATION (Optional)
# ═══════════════════════════════════════════
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Streamify <noreply@streamify.com>"

# ═══════════════════════════════════════════
# CORS & FRONTEND
# ═══════════════════════════════════════════
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### Getting Required Credentials

<details>
<summary><b>📧 Gmail App Password (for Email)</b></summary>

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App passwords
4. Generate a new app password for "Mail"
5. Use this password as `SMTP_PASS`

</details>

<details>
<summary><b>☁️ Cloudinary Credentials</b></summary>

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Use these in your `.env` file

</details>

<details>
<summary><b>🍃 MongoDB Atlas</b></summary>

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string from "Connect" button
5. Replace `<password>` with your database user password

</details>

---

## 📚 API Reference

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication Endpoints

<details>
<summary><b>POST /users/register</b> - Register new user</summary>

**Request Body (multipart/form-data):**

```json
{
  "userName": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "avatar": "[file]"
}
```

**Success Response (201):**

```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "userName": "johndoe",
    "email": "john@example.com",
    "isEmailVerified": false
  },
  "message": "Registration successful! Please check your email.",
  "success": true
}
```

</details>

<details>
<summary><b>POST /users/login</b> - User login</summary>

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

</details>

<details>
<summary><b>GET /users/verify-email/:token</b> - Verify email</summary>

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": { "isEmailVerified": true },
  "message": "Email verified successfully",
  "success": true
}
```

</details>

<details>
<summary><b>POST /users/forgot-password</b> - Request password reset</summary>

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "data": null,
  "message": "If an account exists, a password reset email has been sent",
  "success": true
}
```

</details>

### Video Endpoints

<details>
<summary><b>GET /videos</b> - Get all videos</summary>

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sort | string | -createdAt | Sort field |

**Success Response (200):**

```json
{
  "statusCode": 200,
  "data": {
    "videos": [...],
    "totalDocs": 100,
    "page": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "success": true
}
```

</details>

<details>
<summary><b>POST /videos/upload</b> - Upload video</summary>

**Headers:**

```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| videoFile | file | Yes | Video file (mp4, webm) |
| thumbnail | file | Yes | Thumbnail image |
| title | string | Yes | Video title |
| description | string | Yes | Video description |
| tags | string | Yes | JSON array of tags |

</details>

### Complete API Endpoint List

| Category          | Method | Endpoint                     | Auth | Description        |
| ----------------- | ------ | ---------------------------- | ---- | ------------------ |
| **Auth**          | POST   | /users/register              | ❌   | Register user      |
|                   | POST   | /users/login                 | ❌   | Login              |
|                   | POST   | /users/logout                | ✅   | Logout             |
|                   | POST   | /users/refresh-token         | ❌   | Refresh tokens     |
|                   | GET    | /users/verify-email/:token   | ❌   | Verify email       |
|                   | POST   | /users/forgot-password       | ❌   | Request reset      |
|                   | POST   | /users/reset-password/:token | ❌   | Reset password     |
| **User**          | GET    | /users/current-user          | ✅   | Get profile        |
|                   | PATCH  | /users/change-password       | ✅   | Change password    |
|                   | PATCH  | /users/change-avatar         | ✅   | Update avatar      |
|                   | PATCH  | /users/update-details        | ✅   | Update profile     |
|                   | GET    | /users/c/:username           | ❌   | Get channel        |
| **Videos**        | GET    | /videos                      | ❌   | List videos        |
|                   | GET    | /videos/:id                  | ❌   | Get video          |
|                   | POST   | /videos/upload               | ✅   | Upload video       |
|                   | PATCH  | /videos/update/:id           | ✅   | Update video       |
|                   | DELETE | /videos/:id                  | ✅   | Delete video       |
|                   | PATCH  | /videos/:id/publish          | ✅   | Toggle publish     |
|                   | POST   | /videos/:id/views            | ❌   | Increment views    |
| **Playlists**     | GET    | /playlists                   | ✅   | Get playlists      |
|                   | POST   | /playlists                   | ✅   | Create playlist    |
|                   | PATCH  | /playlists/:id               | ✅   | Update playlist    |
|                   | DELETE | /playlists/:id               | ✅   | Delete playlist    |
| **Comments**      | GET    | /comments/:videoId           | ❌   | Get comments       |
|                   | POST   | /comments/:videoId           | ✅   | Add comment        |
|                   | DELETE | /comments/:id                | ✅   | Delete comment     |
| **Likes**         | POST   | /likes/video/:id             | ✅   | Like video         |
|                   | POST   | /likes/comment/:id           | ✅   | Like comment       |
| **Subscriptions** | POST   | /subscriptions/:channelId    | ✅   | Toggle subscribe   |
|                   | GET    | /subscriptions               | ✅   | Get subscriptions  |
| **History**       | GET    | /history                     | ✅   | Get history        |
|                   | DELETE | /history                     | ✅   | Clear history      |
| **Watch Later**   | GET    | /watchlater                  | ✅   | Get watch later    |
|                   | POST   | /watchlater/:videoId         | ✅   | Add to watch later |

---

## 💾 Database Schema

### Entity Relationships

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE RELATIONSHIPS                            │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │   USER   │────────<│  VIDEO   │>────────│ PLAYLIST │
    └────┬─────┘         └────┬─────┘         └──────────┘
         │                    │
         │    ┌───────────────┼───────────────┐
         │    │               │               │
         ▼    ▼               ▼               ▼
    ┌──────────┐         ┌──────────┐    ┌──────────┐
    │  LIKE    │         │ COMMENT  │    │ HISTORY  │
    └──────────┘         └──────────┘    └──────────┘
         │
         ▼
    ┌──────────────┐         ┌──────────────┐
    │ SUBSCRIPTION │         │ WATCH LATER  │
    └──────────────┘         └──────────────┘

    Legend:
    ──────< One-to-Many     >────── Many-to-One
    ──────○ Optional        ●────── Required
```

### Collections Schema

<details>
<summary><b>👤 User Collection</b></summary>

| Field                      | Type     | Description                  |
| -------------------------- | -------- | ---------------------------- |
| `_id`                      | ObjectId | Primary key                  |
| `userName`                 | String   | Unique username              |
| `email`                    | String   | Unique email                 |
| `fullName`                 | String   | Display name                 |
| `password`                 | String   | Hashed password              |
| `avatar`                   | String   | Profile image URL            |
| `coverImage`               | String   | Banner image URL             |
| `isEmailVerified`          | Boolean  | Email verification status    |
| `emailVerificationToken`   | String   | Token for email verification |
| `emailVerificationExpires` | Date     | Token expiry                 |
| `passwordResetToken`       | String   | Password reset token         |
| `passwordResetExpires`     | Date     | Reset token expiry           |
| `refreshToken`             | String   | JWT refresh token            |
| `createdAt`                | Date     | Account creation date        |
| `updatedAt`                | Date     | Last update date             |

</details>

<details>
<summary><b>🎥 Video Collection</b></summary>

| Field               | Type     | Description             |
| ------------------- | -------- | ----------------------- |
| `_id`               | ObjectId | Primary key             |
| `title`             | String   | Video title             |
| `description`       | String   | Video description       |
| `videoUrl`          | String   | Cloudinary video URL    |
| `thumbnailUrl`      | String   | Thumbnail URL           |
| `videoPublicId`     | String   | Cloudinary public ID    |
| `thumbnailPublicId` | String   | Thumbnail public ID     |
| `duration`          | Number   | Video length in seconds |
| `views`             | Number   | View count              |
| `isPublished`       | Boolean  | Publish status          |
| `isDeleted`         | Boolean  | Soft delete flag        |
| `owner`             | ObjectId | Reference to User       |
| `tags`              | String[] | Video tags              |

</details>

<details>
<summary><b>📁 Playlist Collection</b></summary>

| Field         | Type       | Description               |
| ------------- | ---------- | ------------------------- |
| `_id`         | ObjectId   | Primary key               |
| `name`        | String     | Playlist name             |
| `description` | String     | Playlist description      |
| `owner`       | ObjectId   | Reference to User         |
| `videos`      | ObjectId[] | Array of Video references |

</details>

<details>
<summary><b>💬 Comment Collection</b></summary>

| Field     | Type     | Description        |
| --------- | -------- | ------------------ |
| `_id`     | ObjectId | Primary key        |
| `content` | String   | Comment text       |
| `video`   | ObjectId | Reference to Video |
| `owner`   | ObjectId | Reference to User  |

</details>

<details>
<summary><b>❤️ Like Collection</b></summary>

| Field     | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `_id`     | ObjectId | Primary key                     |
| `video`   | ObjectId | Reference to Video (optional)   |
| `comment` | ObjectId | Reference to Comment (optional) |
| `likedBy` | ObjectId | Reference to User               |

</details>

<details>
<summary><b>🔔 Subscription Collection</b></summary>

| Field        | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| `_id`        | ObjectId | Primary key                 |
| `subscriber` | ObjectId | User who subscribed         |
| `channel`    | ObjectId | Channel being subscribed to |

</details>

---

## 📂 Project Structure

```
streamify/
│
├── 📂 frontend/                          # React Frontend Application
│   ├── 📂 public/                        # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/                # Reusable UI components
│   │   │   ├── 📂 Video/                 # Video player, cards, list
│   │   │   ├── 📂 Playlist/              # Playlist components
│   │   │   ├── 📂 Upload/                # File upload components
│   │   │   ├── 📂 Profile/               # Profile components
│   │   │   ├── 📂 Form/                  # Form components
│   │   │   ├── 📄 Header.jsx             # Navigation header
│   │   │   ├── 📄 Sidebar.jsx            # Side navigation
│   │   │   └── 📄 Modal.jsx              # Modal component
│   │   │
│   │   ├── 📂 pages/                     # Route page components
│   │   │   ├── 📂 Display/               # Home, Tweet, Subscription
│   │   │   ├── 📂 Account/               # History, Playlist, Videos
│   │   │   └── 📂 You/                   # Profile, Auth, Create
│   │   │
│   │   ├── 📂 context/                   # React Context providers
│   │   │   ├── 📄 AuthContext.jsx        # Authentication state
│   │   │   └── 📄 ThemeContext.jsx       # Theme management
│   │   │
│   │   ├── 📂 services/                  # API client & services
│   │   │   ├── 📄 api.js                 # Axios instance & config
│   │   │   ├── 📄 authService.js         # Auth API calls
│   │   │   └── 📄 videoService.js        # Video API calls
│   │   │
│   │   ├── 📂 hooks/                     # Custom React hooks
│   │   │   ├── 📄 useAuth.js             # Auth hook
│   │   │   ├── 📄 useDebounce.js         # Debounce hook
│   │   │   ├── 📄 useLocalStorage.js     # LocalStorage hook
│   │   │   └── 📄 useVideos.js           # Videos hook
│   │   │
│   │   ├── 📂 routes/                    # Route definitions
│   │   │   ├── 📄 AppRoutes.jsx          # All routes (lazy loaded)
│   │   │   └── 📄 ProtectedRoute.jsx     # Auth guard
│   │   │
│   │   ├── 📂 constants/                 # App constants
│   │   │   └── 📄 index.js               # Centralized constants
│   │   │
│   │   ├── 📄 App.jsx                    # Root component
│   │   ├── 📄 main.jsx                   # Entry point
│   │   └── 📄 index.css                  # Global styles
│   │
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 tailwind.config.js
│
├── 📂 backend/                           # Node.js Backend Application
│   ├── 📂 src/
│   │   ├── 📂 controllers/               # Request handlers
│   │   │   ├── 📄 user.controller.js     # User operations
│   │   │   ├── 📄 video.controller.js    # Video CRUD
│   │   │   ├── 📄 email.controller.js    # Email verification
│   │   │   ├── 📄 playlist.controller.js # Playlist operations
│   │   │   ├── 📄 comment.controller.js  # Comment operations
│   │   │   ├── 📄 like.controller.js     # Like operations
│   │   │   └── 📄 subscription.controller.js
│   │   │
│   │   ├── 📂 routes/                    # Express routes
│   │   │   ├── 📄 user.routes.js         # /api/v1/users
│   │   │   ├── 📄 video.routes.js        # /api/v1/videos
│   │   │   └── 📄 ...                    # Other routes
│   │   │
│   │   ├── 📂 models/                    # Mongoose schemas
│   │   │   ├── 📄 user.model.js
│   │   │   ├── 📄 video.model.js
│   │   │   └── 📄 ...
│   │   │
│   │   ├── 📂 middlewares/               # Express middleware
│   │   │   ├── 📄 auth.middleware.js     # JWT verification
│   │   │   ├── 📄 multer.middleware.js   # File upload
│   │   │   └── 📄 validate.middleware.js # Input validation
│   │   │
│   │   ├── 📂 utils/                     # Utility functions
│   │   │   ├── 📄 cloudinary.js          # Cloudinary helpers
│   │   │   ├── 📄 email.js               # Email service
│   │   │   ├── 📄 APIerror.js            # Error class
│   │   │   └── 📄 APIresponse.js         # Response class
│   │   │
│   │   ├── 📂 templates/                 # Email templates
│   │   │   ├── 📄 verify-email.hbs
│   │   │   ├── 📄 welcome.hbs
│   │   │   ├── 📄 password-reset.hbs
│   │   │   └── 📄 password-changed.hbs
│   │   │
│   │   ├── 📂 database/                  # Database connection
│   │   │   └── 📄 index.js               # MongoDB connection
│   │   │
│   │   ├── 📄 app.js                     # Express app setup
│   │   ├── 📄 index.js                   # Server entry point
│   │   └── 📄 constants.js               # Backend constants
│   │
│   ├── 📄 package.json
│   └── 📄 .env.example
│
├── 📄 README.md
└── 📄 LICENSE
```

---

## 🔧 Development

### Available Scripts

**Backend:**

```bash
npm run dev      # Start with nodemon (hot reload)
npm run start    # Production start
```

**Frontend:**

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style

- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

### Testing API Endpoints

Use the following tools to test API:

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set root directory: `backend`
3. Set start command: `npm start`
4. Add all environment variables

### Docker (Coming Soon)

```bash
docker-compose up -d
```

---

## 🗺️ Roadmap

### 🎯 Short-Term Goals (1-3 Months)

<table>
<tr>
<th>Category</th>
<th>Feature</th>
<th>Priority</th>
<th>Status</th>
</tr>

<tr>
<td rowspan="4"><strong>🎨 UI/UX</strong></td>
<td>Dark/Light theme toggle</td>
<td>🔴 High</td>
<td>🟡 In Progress</td>
</tr>
<tr>
<td>Mobile-responsive video player</td>
<td>🔴 High</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Skeleton loading states</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Improved error messages & feedback</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>

<tr>
<td rowspan="4"><strong>🔧 Backend</strong></td>
<td>Redis caching for videos</td>
<td>🔴 High</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Video quality selection (360p, 720p, 1080p)</td>
<td>🔴 High</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Improved video compression pipeline</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>API documentation with Swagger</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>

<tr>
<td rowspan="3"><strong>🔐 Security</strong></td>
<td>Two-factor authentication (2FA)</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>OAuth providers (GitHub, Discord)</td>
<td>🟢 Low</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Account activity logging</td>
<td>🟢 Low</td>
<td>📋 Planned</td>
</tr>

<tr>
<td rowspan="3"><strong>✨ Features</strong></td>
<td>Video chapters/timestamps</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Nested comment replies</td>
<td>🟠 Medium</td>
<td>📋 Planned</td>
</tr>
<tr>
<td>Share video to social media</td>
<td>🟢 Low</td>
<td>📋 Planned</td>
</tr>
</table>

### 🚀 Long-Term Goals (3-12 Months)

<table>
<tr>
<th>Category</th>
<th>Feature</th>
<th>Description</th>
</tr>

<tr>
<td rowspan="3"><strong>📺 Streaming</strong></td>
<td>Live Streaming</td>
<td>Real-time video broadcasting with WebRTC/HLS</td>
</tr>
<tr>
<td>Adaptive Bitrate Streaming</td>
<td>Auto-adjust quality based on network conditions</td>
</tr>
<tr>
<td>Live Chat</td>
<td>Real-time chat during live streams with WebSocket</td>
</tr>

<tr>
<td rowspan="3"><strong>💰 Monetization</strong></td>
<td>Creator Payments</td>
<td>Stripe integration for channel memberships</td>
</tr>
<tr>
<td>Super Chat / Tips</td>
<td>Allow viewers to tip creators during streams</td>
</tr>
<tr>
<td>Premium Subscriptions</td>
<td>Ad-free experience for paying users</td>
</tr>

<tr>
<td rowspan="3"><strong>🤖 AI Features</strong></td>
<td>Auto-generated Captions</td>
<td>Speech-to-text for video subtitles</td>
</tr>
<tr>
<td>Content Moderation</td>
<td>AI-powered comment and video moderation</td>
</tr>
<tr>
<td>Video Recommendations</td>
<td>ML-based personalized video suggestions</td>
</tr>

<tr>
<td rowspan="3"><strong>📱 Platform</strong></td>
<td>Mobile Apps</td>
<td>React Native apps for iOS and Android</td>
</tr>
<tr>
<td>Desktop App</td>
<td>Electron app for Windows/Mac/Linux</td>
</tr>
<tr>
<td>TV Apps</td>
<td>Smart TV applications (Android TV, Roku)</td>
</tr>

<tr>
<td rowspan="3"><strong>🔧 Infrastructure</strong></td>
<td>Microservices Architecture</td>
<td>Split into video, user, notification services</td>
</tr>
<tr>
<td>Kubernetes Deployment</td>
<td>Container orchestration for scalability</td>
</tr>
<tr>
<td>Global CDN</td>
<td>Multi-region video delivery network</td>
</tr>

<tr>
<td rowspan="3"><strong>📊 Analytics</strong></td>
<td>Creator Dashboard</td>
<td>Detailed analytics for video performance</td>
</tr>
<tr>
<td>Viewer Insights</td>
<td>Watch time, retention, demographics</td>
</tr>
<tr>
<td>Revenue Reports</td>
<td>Earnings breakdown and payout history</td>
</tr>
</table>

### 📌 Feature Request

Have an idea? [Open an issue](https://github.com/Anurag-Basuri/streamify/issues/new) with the `enhancement` label!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Commit Convention

| Prefix      | Description        |
| ----------- | ------------------ |
| `feat:`     | New feature        |
| `fix:`      | Bug fix            |
| `docs:`     | Documentation      |
| `style:`    | Formatting         |
| `refactor:` | Code restructuring |
| `test:`     | Tests              |
| `chore:`    | Maintenance        |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Anurag Basuri**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Anurag-Basuri)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ and lots of ☕

</div>
