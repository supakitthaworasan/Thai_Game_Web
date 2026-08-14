import express from 'express';
import movieRoute from './routes/movieRoute.js';
import pool from './config/db.js';

const app = express();

const PORT = 5001;

app.use(express.json());
app.use("/movies", movieRoute);

app.listen(PORT, async ()=>{
    console.log(`Server is running on port ${PORT}`);

    try{
        const result = await pool.query('SELECT NOW()');
        console.log('DATABASE CONNECTION SUCCESSFUL:', result.rows[0]);
    }catch(err){
        console.error('DATABASE CONNECTON FAILED:', err.message);
    }

});