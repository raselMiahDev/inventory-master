import express from "express";
import cors from "cors";
import {errorHandler} from "./middlewares/error.middleware";
import v1Router from "./api/api"
import dotenv from "dotenv";
dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/", (_req, res) => {
    res.send("API is running 🚀");
});

// global error handler
app.use(errorHandler);

app.use("/v1",v1Router)

export default app;
