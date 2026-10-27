import { Router } from "express";
import User from "../models/User.js";
import mongoose from "mongoose";
import { getProfilePhotoUrl } from "../services/s3.service.js";


const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const { name } = req.body;
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "A valid name is required!" })
        }
        const trimmedName = name.trim();
        if (trimmedName.length > 40) {
            return res.status(400).json({
                message: "Name cannot exceed 40 characters.",
            });
        }
        const user = await User.create({
            name: trimmedName,
        });
        return res.status(201).json({
            message: "User created successfully.",
            user,
        });
    } catch (err) {
        next(err)
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID!" });
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const photoUrl = user.profilePhotoKey
            ? await getProfilePhotoUrl(user.profilePhotoKey)
            : null;
        return res.json({
            user: {
                _id: user._id,
                name: user.name,
                profilePhotoKey: user.profilePhotoKey,
                photoUrl,
            },
        });
    } catch (err) {
        next(err);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "A valid name is required!" })
        }
        const trimmedName = name.trim();
        if (trimmedName.length > 40) {
            return res.status(400).json({
                message: "Name cannot exceed 40 characters.",
            });
        }
        const user = await User.findByIdAndUpdate(id, { name: trimmedName }, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
});

export default router;