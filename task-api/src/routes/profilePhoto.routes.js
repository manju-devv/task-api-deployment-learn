import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { getProfilePhotoUrl, uploadProfilePhoto, deleteProfilePhoto } from "../services/s3.service.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";


const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024,
        files: 1,
    },
});

const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

router.post("/", upload.single("photo"), async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required.",
            });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID.",
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a photo.",
            });
        }
        if (!allowedTypes.has(req.file.mimetype)) {
            return res.status(400).json({
                message: "Only JPEG, PNG, and WebP images are allowed.",
            });
        }
        const detectedType = await fileTypeFromBuffer(req.file.buffer);
        console.log("detective", detectedType);
        if (!detectedType || !allowedTypes.has(detectedType.mime) || detectedType.mime !== req.file.mimetype) {
            return res.status(400).json({
                message: "Invalid image. Upload a genuine JPEG, PNG, or WebP file.",
            });
        }

        try {
            await sharp(req.file.buffer, {
                limitInputPixels: 40_000_000,
            }).metadata();
        } catch {
            return res.status(400).json({
                message: "The uploaded image is corrupted or invalid.",
            });
        }
        const extensionByType = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        };
        const key = `profile-photos/${randomUUID()}.${extensionByType[req.file.mimetype]}`;
        const previousKey = user.profilePhotoKey;
        await uploadProfilePhoto({
            fileBuffer: req.file.buffer,
            contentType: req.file.mimetype,
            key,
        });
        try {
            user.profilePhotoKey = key;
            await user.save();
        } catch (dbError) {
            try {
                await deleteProfilePhoto(key);
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up S3 object:",
                    key,
                    cleanupError.message
                );
            }
            throw dbError;
        }

        if (previousKey && previousKey !== key) {
            try {
                await deleteProfilePhoto(previousKey);
                console.log("Old profile photo deleted:", previousKey);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete old profile photo:",
                    cleanupError.message
                );
            }
        }

        const url = await getProfilePhotoUrl(key);
        return res.status(201).json({
            message: "Profile photo uploaded successfully.",
            key,
            url,
        });
    } catch (err) {
        next(err);
    }
});

export default router;