import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser"; // Import cookie-parser

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

export { app };
