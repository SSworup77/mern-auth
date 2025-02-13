import express, { response } from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";

const app =express();
const port=process.env.PORT || 4000
connectDB();
app.use(express.json());
app.use(cors({credentials:true}));
app.use(cookieParser());

app.get('/',(req,res)=>res.send("API working"));
app.listen(port,()=>console.log(`Server started on PORT:${port}`));
