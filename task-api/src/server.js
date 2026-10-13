import express from "express";
import dotenv from "dotenv";
// import { tasks } from "../data/dummy.js";
import { connectDB } from "./config/db.js";
import Task from "./models/Task.js";
import mongoose from "mongoose";
import { connectRedis, redisClient } from "./config/redis.js";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json());



const CACHE_TTL = Number(process.env.REDIS_CACHE_TTL ?? 60);

if (!Number.isInteger(CACHE_TTL) || CACHE_TTL <= 0) {
    throw new Error("REDIS_CACHE_TTL must be a positive integer");
}

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Task API is running 🚀"
    })
});

app.get("/tasks", async (req, res) => {
    const cacheKey = "tasks:all";
    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks !== null) {
        console.log("Cache HIT!");
        return res.status(200).json({
            tasks: JSON.parse(cachedTasks)
        });
    };
    console.log("Cache Miss");
    const tasks = await Task.find().lean();
    await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: CACHE_TTL })
    res.status(200).json({ tasks })
});

app.post("/tasks", async (req, res) => {
    const { title } = req.body;
    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            message: "Title must be a non-empty string!",
        });
    }
    // tasks.push({ id: tasks.length + 1, title, completed: false });
    const task = await Task.create({ title })
    await redisClient.del("tasks:all");
    res.status(201).json({
        message: "item added successfully!",
        data: task,
    });

});

app.get("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    const task = await Task.findById(id);
    if (!task) {
        return res.status(404).json({
            message: "Task not found!"
        });
    };
    return res.status(200).json({ task });
    // const id = req.params.id;
    // const item = tasks.find((it) => it.id === Number(id));
    // if (!item) {
    //     return res.status(404).json({
    //         message: `invalid id provided! ${id}`
    //     });
    // };
    // return res.status(200).json({
    //     item
    // });
});

app.delete("/tasks/:id", async (req, res) => {

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
        return res.status(404).json({
            message: "Task not found!",
        });
    };
    await redisClient.del("tasks:all");
    return res.status(200).json({
        message: "Task deleted successfully!",
        task,
    });
    // const id = req.params.id;
    // const idToRemove = tasks.findIndex(item => item.id === Number(id));
    // const task = tasks.find((item) => item.id === Number(id));
    // if (idToRemove !== -1) {
    //     tasks.splice(idToRemove, 1);
    //     return res.status(200).json({
    //         message: "item deleted successfully",
    //         task
    //     });
    // };
    // return res.status(404).json({
    //     message: `Invalid id provided: ${id}`
    // })
});

app.put("/tasks/:id", async (req, res) => {

    const { id } = req.params;
    const { title, completed } = req.body;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: "Invalid task ID!",
        });
    }
    if (typeof title !== "string" || !title.trim() ||
        typeof completed !== "boolean") {
        return res.status(400).json({
            message: "A valid title and completed boolean are required!",
        });
    }
    const task = await Task.findByIdAndUpdate(id,
        { title: title.trim(), completed },
        { returnDocument: "after", runValidators: true }
    );
    if (!task) {
        return res.status(404).json({
            message: "Task not found!",
        });
    }
    await redisClient.del("tasks:all");
    return res.status(200).json({
        message: "Task updated successfully!",
        task,
    });

    // const id = req.params.id;
    // const { title, completed } = req.body;
    // if (!title?.trim() || completed === undefined) {
    //     return res.status(400).json({
    //         message: "title and completed fields cant be empty!",
    //     });
    // };
    // const taskToUpdate = tasks.find(item => item.id === Number(id));
    // if (!taskToUpdate) {
    //     return res.status(404).json({
    //         message: "Task not found!",
    //         error: `Invalid id provided: ${id}`,
    //     });
    // }
    // taskToUpdate.title = title;
    // taskToUpdate.completed = completed;
    // return res.status(200).json({
    //     message: "Task updated successfully!",
    //     task: taskToUpdate
    // });
});

async function startServer() {
    await connectDB();
    await connectRedis();
    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
    return server;
};

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: statusCode === 500
            ? "Internal Server Error"
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