import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
dotenv.config();
const app=express();
const PORT = process.env.PORT || 5000;
app.get("/",(req,res)=>{
    res.send("hello world 1234");
});
app.use("/api/auth",authRoutes);
app.listen(5000,()=>{
    connectDB();
    console.log("Server is running on port 3000");
});

