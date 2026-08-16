import {pool} from '../config/db.js';

const addMovie = async (req, res)=>{

    try {
        const {title, overview, release_year, genres, 
            runtime, poster_url, created_by} = req.body;

        // Check if movie already exists
        const existingMovie = await pool.query(
            `SELECT id from "Movie"
            WHERE title = $1`,[title]
        );

        if (existingMovie.rows.length > 0){
            return res.status(400).json({
                error: "Movie already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO "Movie" (title, overview, release_year, genres, 
            runtime, poster_url, created_by)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, overview, release_year, genres, 
            runtime, poster_url, created_by, created_at`, 
            [title, overview, release_year, genres, 
            runtime, poster_url, created_by]
        );

        const added_movie = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data:{
                movie:{
                    id: added_movie.id,
                    title: added_movie.title,
                    overview: added_movie.overview,
                    release_year: added_movie.release_year,
                    genres: added_movie.genres,
                    runtime: added_movie.runtime,
                    poster_url: added_movie.poster_url,
                    created_by: added_movie.created_by,
                    created_at: added_movie.created_at
                }
            }
        });

        
    } catch (error) {
        console.error("addMovie error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }

};


export {addMovie};