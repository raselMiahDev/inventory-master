import express from "express";
import cors from "cors";
import {errorHandler} from "./middlewares/error.middleware";
import v1Router from "./api/api"
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀🚀🚀API is working!' });
});

// ✅ FOR LOCAL DEVELOPMENT ONLY
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local server running on port ${PORT}`);
  });
}

// global error handler
app.use(errorHandler);

app.use("/v1",v1Router)

export default app;
