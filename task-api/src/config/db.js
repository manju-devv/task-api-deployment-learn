import mongoose from "mongoose";
export async function connectDB() {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}`);
        console.log("MongoDB connected successfully!");
    } catch (err) {
        console.error("Mongo db connection failed:", err.message);
        process.exit(1);
    }
}