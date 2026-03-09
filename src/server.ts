import app from ".";
import { connectDB } from "./config/db";
import { getEnvConfig } from "./config/env";

const startServer = async () => {
    await connectDB();

    app.listen(getEnvConfig().PORT, () => {
        console.log(`🚀 Server running on port ${getEnvConfig().PORT}`);
    });
};

startServer();
