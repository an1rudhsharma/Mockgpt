import express from "express";
import dotenv from "dotenv";
import { appRouter } from "./router/AuthRouter";
import cors from 'cors'
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json());

app.use("/api/v1", appRouter);

const port = process.env.BACKEND_PORT || 3000;

app.listen(port, () => {
    console.log(`listening on port : ${port}`);
});