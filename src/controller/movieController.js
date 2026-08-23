import { json } from 'express';
import { pool } from '../config/db.js';

const addMovie = async (req, res) => {

    try {
        const { title, overview, release_year, genres,
            runtime, poster_url } = req.body;

        // Check if movie already exists
        const existingMovie = await pool.query(
            `SELECT id from "Movie"
            WHERE title = $1`, [title]
        );

        if (existingMovie.rows.length > 0) {
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
                runtime, poster_url, req.user.id]
        );

        const added_movie = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data: {
                movie: {
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

const deleteMovie = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "Movie"
            WHERE id = $1`, [req.params.id],
        );

        const movieItem = result.rows[0];

        if (!movieItem) {
            return res.status(404).json({ error: "Movie not found" });
        }

        //ensure only owner can delete
        if (movieItem.created_by !== req.user.id) {
            return res.status(403).json({
                error: "Not allowed to delete"
            })
        }

        await pool.query(`
            DELETE FROM "Movie"
            WHERE id = $1`, [req.params.id]);

        res.status(200).json({
            message: "Movie has been deleted successfully"
        });

    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { title, overview, release_year, genres, runtime, poster_url } = req.body;

        //Find movie
        const findMovie = await pool.query(`
        SELECT * FROM "Movie"
        WHERE id = $1
        `, [req.params.id]
        );

        const movie = findMovie.rows[0];

        //Check if Movie exists
        if (!movie) {
            return res.status(404).json({
                error: "Movie not found"
            });
        }

        //Check ownership
        if (req.user.id !== movie.created_by) {
            return res.status(403).json({
                error: "Not allowed"
            });
        }

        //Update
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (overview !== undefined) updateData.overview = overview;
        if (release_year !== undefined) updateData.release_year = release_year;
        if (genres !== undefined) updateData.genres = genres;
        if (runtime !== undefined) updateData.runtime = runtime;
        if (poster_url !== undefined) updateData.poster_url = poster_url;
 

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No data to update" })
        };

        const fields = [];
        const values = [];

        let index = 1;

        for (const [column, value] of Object.entries(updateData)) {
            fields.push(`${column} =$${index}`);
            values.push(value);
            index++;
        }

        values.push(req.params.id);


        const query = await pool.query(`UPDATE "Movie" SET ${fields.join(",")}, created_at = NOW() WHERE id = $${index} RETURNING *`, values);

        res.status(200).json({
            status: "success",
            data: {
                Movie: query.rows[0],
            }
        });
    } catch (error) {
        console.error("Update error", error);
        res.status(500).json({error: "Internal server error"});

    }
}

const getMovie = async (req, res)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM "Movie"`
        );

        const movies = result.rows;
        //Check item exists
        if(movies.length === 0){
            return res.status(200).json({message: "No Movies"});
        }

        res.status(200).json({
            data:{
                movies,
            }
        });


    } catch (error) {
        console.error("GET Movies error", error);
        res.status(500).json({
            error:"Internal Server error"
        });
    }
}

export { addMovie, deleteMovie, updateMovie, getMovie };