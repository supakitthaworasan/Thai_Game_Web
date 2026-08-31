import express from 'express';
import { connectDB ,disconnectDB } from './config/db.js'
import gameRoutes from './routes/gameRoutes.js'
import authRoutes from './routes/authRoutes.js'


const app = express();

//API Routes
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/game", gameRoutes);
app.use("/auth", authRoutes);

const PORT = 2001;

const startServer = async ()=>{
    await connectDB();

    app.listen(PORT, ()=>{
        console.log(`Server running on PORT: ${PORT}`);
    });
};

startServer();


process.on("unhandledRejection", (err)=>{
    console.error("Unhandled Rejection:", err);
    startServer.close(async ()=>{
        await disconnectDB();
        process.exit(1)
    });
});

process.on("uncaughtException", async (err)=>{
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async ()=>{
    console.log("SIGTERM received, shutting down gracefully");
    startServer.close(async ()=>{
        await disconnectDB();
        process.exit(0);
    });
});

process.on("SIGINT", async ()=>{
    console.log("SIGINT received, shutting down gracefully");

    startServer.close(async ()=>{
        await disconnectDB();
        process.exit(0);
    });
});

// http://localhost:2001/auth/register
// http://localhost:2001/auth/login
// http://localhost:2001/auth/logout
