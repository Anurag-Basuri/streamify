# 🎬 Streamify - Modern Video Streaming Platform

Streamify is a full-stack video streaming platform built with **React**, **Node.js**, and **MongoDB**. It provides a modern, responsive interface for uploading, sharing, and discovering videos, with features like playlists, watch later, history, and more.

---

## 🚩 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Components](#key-components)
- [API Endpoints](#api-endpoints)
- [Theme Customization](#theme-customization)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🌟 Features

### User Experience
- **Dark/Light Theme** with instant toggle (TailwindCSS)
- **Responsive Design** for mobile, tablet, and desktop
- **Animated UI** (Framer Motion)
- **Real-time Search** and filtering
- **Infinite Scroll** for video feeds

### Video Features
- **Video Upload** (up to 2GB, with thumbnail support)
- **Custom Video Player** with playback controls
- **Video Compression** (FFmpeg integration)
- **Thumbnails & Metadata** management
- **Edit, Delete, and Publish/Unpublish** your videos
- **Watch History** and **Watch Later** queue
- **Playlists**: create, edit, and manage
- **Like/Comment System**

### User Features
- **JWT Authentication** (register, login, Google OAuth)
- **User Profiles** with avatars and cover images
- **Playlist Management**
- **Subscriptions** to channels
- **Video History Tracking**
- **Download Videos** (if allowed)

### Technical Features
- **RESTful API** with Express.js
- **Cloudinary** for media storage
- **Multer** for file uploads
- **FFmpeg** for server-side video compression
- **API Rate Limiting & Security**
- **Robust Error Handling**
- **Environment-based configuration**

---

## 🛠️ Tech Stack

### Frontend
- [React](https://reactjs.org/) (Vite)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)
- [React Hot Toast](https://react-hot-toast.com/)
- [Heroicons](https://heroicons.com/)

### Backend
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [Cloudinary](https://cloudinary.com/)
- [Multer](https://github.com/expressjs/multer)
- [FFmpeg](https://ffmpeg.org/) (via [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg))
- [JWT](https://jwt.io/) Authentication

---

## 📁 Project Structure

```
streamify/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components (routes)
│   │   ├── context/       # React context providers
│   │   ├── services/      # API and utility services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── routes/        # Route definitions
│   │   └── utils/         # Utility functions
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Express route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express routes
│   │   ├── middlewares/   # Custom middlewares (auth, multer, etc.)
│   │   └── database/      # DB connection logic
│   └── uploads/           # Uploaded files (if not using Cloudinary)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **MongoDB** (local or Atlas)
- **Cloudinary** account (for media storage)
- **FFmpeg** installed and available in your system PATH

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/streamify.git
    cd streamify
    ```

2. **Install Dependencies**
    ```bash
    # Frontend
    cd frontend
    npm install

    # Backend
    cd ../backend
    npm install
    ```

3. **Environment Setup**

    - **Frontend (`frontend/.env`):**
        ```
        VITE_API_URL=http://localhost:8000
        VITE_CLOUD_NAME=your_cloudinary_cloud_name
        ```

    - **Backend (`backend/.env`):**
        ```
        PORT=8000
        MONGODB_URI=your_mongodb_uri
        JWT_SECRET=your_jwt_secret
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```

4. **Run the Application**
    ```bash
    # Frontend
    cd frontend
    npm run dev

    # Backend
    cd ../backend
    npm run dev
    ```

---

## 🔑 Key Components

### Frontend
- **Sidebar.jsx** - Navigation sidebar with theme toggle
- **Header.jsx** - Main navigation header with search
- **VideoCard.jsx** - Video display component
- **PlaylistManager.jsx** - Playlist management UI
- **ThemeProvider.jsx** - Theme context provider
- **WatchLater.jsx** & **History.jsx** - User video queues
- **YourVideos.jsx** - Manage your uploaded videos (edit, delete, publish, update thumbnail)

### Backend APIs
- `/api/v1/auth` - Authentication (register, login, Google OAuth)
- `/api/v1/videos` - Video CRUD, search, publish/unpublish, compression
- `/api/v1/playlists` - Playlist CRUD
- `/api/v1/users` - User profile and settings
- `/api/v1/comments` - Comment system
- `/api/v1/watchlater` - Watch Later queue
- `/api/v1/history` - Watch History

---

## 🧩 API Endpoints (Sample)

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | `/api/v1/auth/register`         | Register a new user          |
| POST   | `/api/v1/auth/login`            | Login                        |
| GET    | `/api/v1/videos`                | List all videos              |
| POST   | `/api/v1/videos`                | Upload a new video           |
| PATCH  | `/api/v1/videos/update/:id`     | Update video details         |
| PATCH  | `/api/v1/videos/:id/publish`    | Toggle publish status        |
| DELETE | `/api/v1/videos/:id`            | Delete a video               |
| GET    | `/api/v1/videos/user`           | Get current user's videos    |
| GET    | `/api/v1/playlists`             | List playlists               |
| ...    | ...                             | ...                          |

---

## 🎨 Theme Customization

The application supports both light and dark themes via TailwindCSS.  
You can customize colors in `tailwind.config.js` and use the theme toggle in the UI.

```css
/* Example theme.css */
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #6d28d9;
}

[data-theme='dark'] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --primary: #7c3aed;
}
```

---

## 📝 Environment Variables

**Frontend (`frontend/.env`):**
```
VITE_API_URL=http://localhost:8000
VITE_CLOUD_NAME=your_cloudinary_cloud_name
```

**Backend (`backend/.env`):**
```
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [FFmpeg](https://ffmpeg.org/)
- [Heroicons](https://heroicons.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Multer](https://github.com/expressjs/multer)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

---

**Streamify** is built for learning, experimentation, and as a foundation for your own video platform ideas.  
Feel free to fork, contribute, and make it your own!