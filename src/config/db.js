import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const connectDB = async ()=>{
    try {
        const client = await pool.connect();
        console.log("DB connected via Postgre");
        client.release();
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
}

const disconnectDB = async ()=>{
    await pool.end();
}
export {pool, connectDB, disconnectDB};