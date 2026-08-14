import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {Pool} = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


const connectDB = async ()=>{

    try{
        const client = await pool.connect();
        console.log('DATABASE CONNECTED VIA PostgreSQL');
        client.release();
    }catch(err){
        console.error('DATABASE CONNECTION FAILED:', err.message);
        process.exit(1);

    }
}

const disconnectDB = async ()=>{
    await pool.end();
}

export {pool, connectDB, disconnectDB};