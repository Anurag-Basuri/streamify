import cookieParser from "cookie-parser"; // Import cookie-parser
import cors from "cors";
import express from "express";

const app = express();

// Add your middleware, routes, etc. here
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Use cookieParser

// import routes
import userRouter from "./routes/user.routes.js";

// use routes
// http://localhost:8000/api/v1/users/.....
app.use("/api/v1/users", userRouter);

export { app };
