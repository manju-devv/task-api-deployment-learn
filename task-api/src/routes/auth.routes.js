import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../services/google-auth.service.js";
import { generateAuthToken } from "../utils/generate-auth-token.js";
import { verifyTurnstileToken } from "../services/verify-turnstile.service.js";

const router = Router();

router.post("/signup", async (req, res) => {
    const { name, email, password, turnstileToken } = req.body;
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken);
    if (!isCaptchaValid) {
        return res.status(400).json({
            message: "CAPTCHA verification failed. Please try again.",
        });
    }
    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || password.length < 8
    ) {
        return res.status(400).json({
            message: "Valid name, email and password (minimum 8 characters) are required",
        });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(409).json({
            message: "An account with this email already exists."
        });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
    });
    return res.status(201).json({
        message: "Account created successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

router.post("/login", async (req, res) => {
    const { email, password, turnstileToken } = req.body;
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken);
    if (!isCaptchaValid) {
        return res.status(400).json({
            message: "CAPTCHA verification failed. Please try again.",
        });
    }
    if (
        typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password
    ) {
        return res.status(400).json({
            message: "Email and password are required.",
        });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({
        email: normalizedEmail,
    });
    if (!user || !user.passwordHash) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }
    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password.",
        });
    }

    // const token = jwt.sign(
    //     { sub: user._id.toString() },
    //     process.env.JWT_SECRET,
    //     { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    // );
    const token = generateAuthToken(user._id);
    return res.status(200).json({
        message: "Login successful!",
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});


router.post("/google", async (req, res, next) => {
    try {
        const { idToken, turnstileToken } = req.body;
        const isCaptchaValid = await verifyTurnstileToken(turnstileToken);
        if (!isCaptchaValid) {
            return res.status(400).json({
                message: "CAPTCHA verification failed. Please try again.",
            });
        }
        if (typeof idToken !== "string" || !idToken.trim()) {
            return res.status(400).json({
                message: "Google ID token is required.",
            });
        }
        // Step 1: Verify the token with Google.
        let googleUser;
        try {
            googleUser = await verifyGoogleIdToken(idToken);
        } catch {
            return res.status(401).json({
                message: "Google authentication failed.",
            });
        }
        // Step 2: Check whether this Google account already exists.
        let user = await User.findOne({
            googleId: googleUser.googleId,
        });
        // Step 3: If it doesn't exist, check whether the email
        // already belongs to another authentication method.
        if (!user) {
            const existingUser = await User.findOne({
                email: googleUser.email,
            });
            if (existingUser) {
                return res.status(409).json({
                    message:
                        "An account with this email already exists. Please sign in using your existing login method.",
                });
            }
            // Step 4: Create a new Google user.
            user = await User.create({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.googleId,
                passwordHash: null,
            });
        }
        // Step 5: Issue our own TodoNest JWT.
        // const token = jwt.sign(
        //     { sub: user._id.toString() },
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        //     }
        // );
        const token = generateAuthToken(user._id);
        return res.status(200).json({
            message: "Google authentication successful.",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
});


export default router;