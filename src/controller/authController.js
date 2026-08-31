import bcrypt from 'bcryptjs';
import {pool} from '../config/db.js'
import { generateToken } from '../utils/generateToken.js';


const register = async (req, res)=>{
    try {
        const {username, email, password} = req.body;

        //Check if user already exists
        const existingUser = await pool.query(
            `SELECT user_id
            FROM "users"
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
        const defualt_role = 2;

        // Create User
        const result = await pool.query(
            `INSERT INTO "users" (username, email, password_hash, role_id)
            VALUES($1, $2, $3, ${defualt_role})
            RETURNING username, email, role_id`, [username, email, hashedPassword]
        );

        const user = result.rows[0];

        // Generate JWT Token

        // Send back result to Client
        res.status(201).json({
            status: "success",
            data: {
                user:{
                    id: user.user_id,
                    name: user.username,
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

const login = async (req, res)=>{
    try {
        const {email, password} = req.body;

        //Check if Email aleady exists
        const existingEmail = await pool.query(
            `SELECT user_id, username, email, password_hash FROM "users"
            WHERE email = $1`,[email]
        );

        if (existingEmail.rows.length === 0){
            return res.status(401).json({
                error:"Invalid Email or Password"
            });
        }

        const user = existingEmail.rows[0];

        //Compare Password
        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch){
            return res.status(401).json({
                error: "Invalid Email or Password"
            });
        }

        // Generate JWT Token 
        const token = generateToken(user.user_id, res);

        res.status(200).json({
            status: "success",
            data:{
                user:{
                    id: user.user_id,
                    name: user.username,
                    email: user.email
                },
                token
            },
        });
        
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            error:"Internal server error"
        });
    }
}

const logout = async (req, res)=>{
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
}

export {register, login, logout};