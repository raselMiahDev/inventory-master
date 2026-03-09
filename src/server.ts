import app from "./app";
import { connectDB } from "./config/db";
import { getEnvConfig } from "./config/env";

// ✅ Connect to DB (non-blocking)
connectDB().catch(console.error);

// ✅ Export app for Vercel (CRITICAL)
export default app;

// ✅ For LOCAL DEVELOPMENT ONLY
if (process.env.NODE_ENV !== 'production') {
    const PORT = getEnvConfig().PORT;
    app.listen(PORT, () => {
        console.log(`🚀 Local server running on port ${PORT}`);
    });
}