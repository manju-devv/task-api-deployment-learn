
import { Router } from "express";
import User from "../models/User.js";
import { getProfilePhotoUrl } from "../services/s3.service.js";

const router = Router();

// Get the currently authenticated user's profile.
router.get("/me", async (req, res, next) => {
    try {
        console.log("usere-----",req.user);
        const user = req.user;
        const photoUrl = user.profilePhotoKey
            ? await getProfilePhotoUrl(user.profilePhotoKey)
            : null;

        return res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePhotoKey: user.profilePhotoKey,
                photoUrl,
            },
        });
    } catch (err) {
        next(err);
    }
});

// Update the currently authenticated user's profile.
router.patch("/me", async (req, res, next) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "A valid name is required!",
            });
        }
        const trimmedName = name.trim();
        if (trimmedName.length > 40) {
            return res.status(400).json({
                message: "Name cannot exceed 40 characters.",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: trimmedName },
            {
                new: true,
                runValidators: true,
            }
        ).select("_id name email profilePhotoKey");
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }
        return res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
});

export default router;
