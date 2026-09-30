import express from "express";
import dotenv from "dotenv";
import { tasks } from "../data/dummy.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;


app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Task API is running 🚀"
    })
});

app.get("/tasks", (req, res) => {
    res.status(200).json({ tasks })
})

app.post("/tasks", (req, res) => {
    const { title } = req.body;
    if (!title || title === "") {
        return res.status(400).json({
            message: "Title can't be empty!",
        });
    }
    tasks.push({ id: tasks.length + 1, title, completed: false });
    res.status(201).json({
        message: "item added successfully!",
        data: tasks.at(-1)
    });
});

app.get("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const item = tasks.find((it) => it.id === Number(id));
    if (!item) {
        return res.status(404).json({
            message: `invalid id provided! ${id}`
        });
    };
    return res.status(200).json({
        item
    });
});

app.delete("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const idToRemove = tasks.findIndex(item => item.id === Number(id));
    const task = tasks.find((item) => item.id === Number(id));
    if (idToRemove !== -1) {
        tasks.splice(idToRemove, 1);
        return res.status(200).json({
            message: "item deleted successfully",
            task
        });
    };
    return res.status(404).json({
        message: `Invalid id provided: ${id}`
    })
});

app.put("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const { title, completed } = req.body;
    if (!title?.trim() || completed === undefined) {
        return res.status(400).json({
            message: "title and completed fields cant be empty!",
        });
    };
    const taskToUpdate = tasks.find(item => item.id === Number(id));
    if (!taskToUpdate) {
        return res.status(404).json({
            message: "Task not found!",
            error: `Invalid id provided: ${id}`,
        });
    }
    taskToUpdate.title = title;
    taskToUpdate.completed = completed;
    return res.status(200).json({
        message: "Task updated successfully!",
        task: taskToUpdate
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});