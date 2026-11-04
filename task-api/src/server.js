import express from "express";
// import dotenv from "dotenv";
import "dotenv/config";
// import { tasks } from "../data/dummy.js";
import { connectDB } from "./config/db.js";
import Task from "./models/Task.js";
import mongoose from "mongoose";
import { connectRedis, redisClient } from "./config/redis.js";
import cors from "cors";
import profilePhotoRoutes from "./routes/profilePhoto.routes.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticateUser } from "./middleware/auth.middleware.js";

// dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());

app.use("/profile-photo",authenticateUser, profilePhotoRoutes);
app.use("/users",authenticateUser, userRoutes);
app.use("/auth", authRoutes);

const CACHE_TTL = Number(process.env.REDIS_CACHE_TTL ?? 60);

if (!Number.isInteger(CACHE_TTL) || CACHE_TTL <= 0) {
    throw new Error("REDIS_CACHE_TTL must be a positive integer");
}

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Task API is running 🚀"
    })
});

app.get("/auth/me", authenticateUser, (req, res) => {
    res.status(200).json({
        message: "Authenticated successfully!",
        user: req.user,
    });
});


app.get("/tasks", authenticateUser, async (req, res) => {
    const userId = req.user._id.toString();
    const cacheKey = `tasks:${userId}:all`;
    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks !== null) {
        console.log("Cache HIT!");
        return res.status(200).json({
            tasks: JSON.parse(cachedTasks),
        });
    }
    console.log("Cache MISS");
    const tasks = await Task.find({
        userId: req.user._id,
    }).lean();
    await redisClient.set(
        cacheKey,
        JSON.stringify(tasks),
        { EX: CACHE_TTL }
    );
    return res.status(200).json({ tasks });
});



app.post("/tasks", authenticateUser, async (req, res) => {
    const { title } = req.body;
    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Title must be a non-empty string!",
        });
    }
    const task = await Task.create({
        title: title.trim(),
        userId: req.user._id,
    });
    const cacheKey = `tasks:${req.user._id}:all`;
    await redisClient.del(cacheKey);
    return res.status(201).json({
        message: "Item added successfully!",
        data: task,
    });
});



app.get("/tasks/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    const task = await Task.findOne({
        _id: id,
        userId: req.user._id,
    }).lean();
    if (!task) {
        return res.status(404).json({
            message: "Task not found!",
        });
    }
    return res.status(200).json({ task });
});


app.delete("/tasks/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    const task = await Task.findOneAndDelete({
        _id: id,
        userId: req.user._id,
    });
    if (!task) {
        return res.status(404).json({
            message: "Task not found!",
        });
    }
    const cacheKey = `tasks:${req.user._id}:all`;
    await redisClient.del(cacheKey);
    return res.status(200).json({
        message: "Task deleted successfully!",
        task,
    });
});



app.put("/tasks/:id", authenticateUser, async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof completed !== "boolean"
    ) {
        return res.status(400).json({
            message: "A valid title and completed boolean are required!",
        });
    }
    const task = await Task.findOneAndUpdate(
        {
            _id: id,
            userId: req.user._id,
        },
        {
            title: title.trim(),
            completed,
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );
    if (!task) {
        return res.status(404).json({
            message: "Task not found!",
        });
    }
    const cacheKey = `tasks:${req.user._id}:all`;
    await redisClient.del(cacheKey);
    return res.status(200).json({
        message: "Task updated successfully!",
        task,
    });
});


async function startServer() {
    await connectDB();
    await connectRedis();
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port: ${PORT}`);
    });
    return server;
};

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    let statusCode = err.statusCode || err.status || 500;
    if (err.name === "MulterError") {
        statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    }

    res.status(statusCode).json({
        message: statusCode === 500
            ? `Internal Server Error: ${err.message}`
            : err.message,
    });
}

// app.get("/test-error", (req, res, next) => {
//     next(new Error("Testing centralized error handling"));
// });
// app.get("/test-error", async (req, res) => {
//     throw new Error("Testing Express 5");
// });

app.use(errorHandler);

const server = await startServer();

// process.on("SIGINT", () => {
//     console.log("SIGINT received. Shutting down the server!");
//     server.close(async () => {
//         console.log("HTTP Server closed.");
//         await redisClient.quit();
//         console.log("Redis connection closed!");
//         await mongoose.disconnect();
//         console.log("MongoDB connection closed!")
//     });
// });

async function shutdown() {
    console.log("SIGINT received. Shutting down server!");
    server.close(async (err) => {
        if (err) {
            console.error("Error closing HTTP server:", err);
            process.exitCode = 1;
        } else console.log("HTTP Server closed!")
        try {
            await redisClient.quit();
            console.log("Redis connection closed!");
        } catch (err) {
            console.error("Error closing Redis:", err.message);
            process.exitCode = 1;
        }

        try {
            await mongoose.disconnect();
            console.log("MongoDB connection closed!");
        } catch (err) {
            console.error("Error closing MongoDB:", err.message);
            process.exitCode = 1;
        }
    });
}


process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);