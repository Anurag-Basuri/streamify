# Streamify - Modern Video Streaming Platform

Streamify is a full-stack video streaming platform built with React, Node.js, and MongoDB. It offers a modern, responsive interface for video sharing, playlists, watch later, history, and more.

---

## 🌟 Features

### User Experience
- **Dark/Light Theme Support** (TailwindCSS)
- **Responsive Design** for all devices
- **Infinite Scroll** for video listings
- **Real-time Video Search**
- **Animated UI Components** (Framer Motion)

### Video Features
- Video Upload & Playback (Custom Player)
- Video Thumbnails & Metadata
- Watch History & Watch Later Queue
- Like/Comment System
- Playlists & Playlist Management

### User Features
- JWT Authentication (Login, Register, Google Auth)
- Custom User Profiles & Avatars
- Playlist Management
- Subscription System
- Video History Tracking
- Downloaded Videos

### Technical Features
- JWT Authentication & Middleware
- Cloudinary Media Storage
- Responsive Image Loading
- API Rate Limiting
- Robust Error Handling

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **TailwindCSS** (Dark/Light theme)
- **Framer Motion** (Animations)
- **Axios** (HTTP Client)
- **React Router** (Navigation)
- **React Icons** (Icon Library)
- **React Hot Toast** (Notifications)

### Backend
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** (Authentication)
- **Cloudinary** (Media Storage)

---

## 🚀 Getting Started

### Prerequisites

```bash
node -v >= 16.0.0
npm -v >= 8.0.0
```

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

## 📁 Project Structure

```
streamify/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── database/
│   └── uploads/
└── README.md
```

---

## 🔑 Key Components

### Frontend
- `Sidebar.jsx` - Navigation sidebar with theme toggle
- `Header.jsx` - Main navigation header with search
- `VideoCard.jsx` - Video display component
- `PlaylistManager.jsx` - Playlist management
- `ThemeProvider.jsx` - Theme context provider
- `WatchLater` & `History` - User video queues

### Backend APIs
- `/api/v1/auth` - Authentication routes
- `/api/v1/videos` - Video management
- `/api/v1/playlists` - Playlist operations
- `/api/v1/users` - User management
- `/api/v1/comments` - Comment system
- `/api/v1/watchlater` - Watch Later queue
- `/api/v1/history` - Watch History

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