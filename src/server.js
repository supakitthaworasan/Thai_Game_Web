import express from 'express';
import movieRoute from './routes/movieRoute.js';
import {pool, connectDB, disconnectDB} from './config/db.js';

const app = express();

const PORT = 5001;

app.use(express.json());
app.use("/movies", movieRoute);

const startServer = async ()=>{
    await connectDB();

    app.listen(PORT, async ()=>{
    console.log(`Server is running on port ${PORT}`);
        });
};

startServer();

process.on("unhandledRejection",(err)=>{
    console.error("UNHANDLED error:", err);
    server.close(async ()=>{
        await disconnectDB();
        process.exit(1);
    });
});

process.on("uncaughtException", async (err)=>{
    console.error("UNCAUGHT Exception:", err);
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async ()=>{
    console.log("SIGTERM RECEIVED. Shutting down gracefully");
    server.close(async ()=>{
        await disconnectDB();
        process.exit(0);
    });
});

process.on("SIGINT", async ()=>{
    console.log("SIGINT RECEIVED. Shutting down gracefully");
    server.close(async ()=>{
        await disconnectDB();
        process.exit(0);
    });
});