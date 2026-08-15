import bcrypt from 'bcryptjs';
import {pool} from '../config/db.js'


const register = async (req, res)=>{
    try {
        const {name, email, password} = req.body;

        //Check if user already exists
        const existingUser = await pool.query(
            `SELECT id
            FROM "User"
            WHERE email = $1`, [email]
        );

        if (existingUser.rows.length > 0){
            return res.status(400).json({
                error: "User already exists with this email"
            });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const result = await pool.query(
            `INSERT INTO "User" (name, email, password)
            VALUES($1, $2, $3)
            RETURNING id, name, email`, [name, email, hashedPassword]
        );

        const user = result.rows[0];

        // Send back result to Client
        res.status(201).json({
            status: "success",
            data: {
                user:{
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            }
        });
        
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            error:"Internal server error"
        });
        
    }
}

export {register};