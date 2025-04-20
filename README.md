# Streamify - Video Streaming Platform

Streamify is a modern video streaming platform built with React, Node.js, and MongoDB. It provides a seamless experience for users to upload, watch, and interact with video content.

## Features

- User authentication and authorization
- Video upload and streaming
- Video playback with React Player
- User profile management
- Video comments and interactions
- Responsive design with Tailwind CSS
- Google OAuth integration
- Cloud storage integration (Cloudinary)

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- React Icons
- React Player
- Swiper
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Passport.js (Google OAuth)
- Cloudinary (Media Storage)
- FFmpeg (Video Processing)
- Multer (File Upload)
- Express Validator
- Bcrypt (Password Hashing)

## Project Structure

```
streamify/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── routes/    # Route configurations
│   │   ├── services/  # API services
│   │   └── resources/ # Static resources
│   └── public/        # Public assets
│
└── backend/           # Node.js backend application
    ├── src/
    │   ├── config/   # Configuration files
    │   ├── controllers/ # Request handlers
    │   ├── database/ # Database connection
    │   ├── middlewares/ # Custom middlewares
    │   ├── models/   # Database models
    │   ├── routes/   # API routes
    │   └── utils/    # Utility functions
    └── public/       # Public files
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- FFmpeg
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/streamify.git
cd streamify
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create environment variables:
   - Backend: Create a `.env` file in the backend directory
   - Frontend: Create a `.env` file in the frontend directory

### Environment Variables

#### Backend (.env)
```
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Anurag Basuri