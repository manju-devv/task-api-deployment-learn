import jwt from "jsonwebtoken";
import User from "../models/User.js";


export async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization token is required!"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.sub).select("-passwordHash");
        if (!user) {
            return res.status(401).json({
                message: "User account not found.",
            });
        }
        req.user = user;
        next();
    } catch (err) {
        if (
            err.name === "TokenExpiredError" ||
            err.name === "JsonWebTokenError" ||
            err.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired authentication token.",
            });
        }
        next(err);
    }
}