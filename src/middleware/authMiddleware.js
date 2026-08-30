import jwt from 'jsonwebtoken';
import {pool} from '../config/db.js';

export const authMiddleware = async (req, res, next)=>{
    console.log("autMiddleware reach...");
    let token;

    if (
        req.headers.authorization && req.headers.authorization.startsWith("Bearer")
    ){
        token = req.headers.authorization.split(" ")[1];
        
    } else if (req.cookies?.jwt){
        token = req.cookies.jwt;
        
    }

    if (!token){
        return res.status(401).json({error:"Not authorised, no token provided"});
    }

    try {
        //Verify token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query(
            `SELECT user_id, username, email
            FROM "users"
            WHERE user_id = $1`,
            [decoded.id]
        );

        if (user.rows.length ===0){
            return res.status(401).json({error:"User no longer exists"});
        }

        req.user = user.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({error: "Not authorised, token failed"});
    }
}