import express from 'express';
import cors from 'cors';
import { connectDB ,disconnectDB } from './config/db.js'
import gameRoutes from './routes/gameRoutes.js'
import authRoutes from './routes/authRoutes.js'
import contributorRoutes from './routes/contributorRoutes.js'
import genreRoutes from './routes/genreRoutes.js'
import platformRoutes from './routes/platformRoutes.js'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL, // URL ของ Vite React
    credentials: true                // อนุญาตการส่ง Cookie และ Header
}));

//API Routes
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/game", gameRoutes);
app.use("/auth", authRoutes);
app.use("/contributor", contributorRoutes );
app.use("/genre", genreRoutes);
app.use("/platform", platformRoutes);

const PORT = process.env.PORT || 2001;

const startServer = async ()=>{
    await connectDB();

    app.listen(PORT, "0.0.0.0", ()=>{
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
// http://localhost:2001/game/addGame
