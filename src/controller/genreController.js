import { json } from 'express';
import { pool } from '../config/db.js';

const addGenre = async (req, res) => {

    try {
        const { genre_name} = req.body;

        // Check if Genre already exists
        const existingGenre = await pool.query(
            `SELECT genre_id from "genre"
            WHERE genre_name = $1`, [genre_name]
        );

        if (existingGenre.rows.length > 0) {
            return res.status(400).json({
                error: "Genre already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO "genre" (genre_name)
            VALUES($1)
            RETURNING genre_id, genre_name`,
            [genre_name]
        );

        const added_Genre = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data: {
                Genre: {
                    id: added_Genre.genre_id,
                    genre_name: added_Genre.genre_name,
                    
                }
            }
        });


    } catch (error) {
        console.error("addGenre error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }

};

const deleteGenre = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "genre"
            WHERE genre_id = $1`, [req.params.id],
        );

        const roles = await pool.query(
            `SELECT * FROM "role"
            WHERE role_name = 'DEV' or role_name = 'ADMIN'`,
        )

        const role = roles.rows; 

        const GenreItem = result.rows[0];

        //Check if Genre exists
        if (!GenreItem) {
            return res.status(404).json({ error: "Genre not found" });
        }

        //ensure only owner can delete
        if (req.user.role_id !== role[0].role_id && req.user.role_id !== role[1].role_id ) {
            return res.status(403).json({
                error: `Role ${req.user.role_id} Not allowed to delete`
            })
        }

        await pool.query(`
            DELETE FROM "genre"
            WHERE genre_id = $1`, [req.params.id]);

        res.status(200).json({
            message: `Genre ${req.params.id} has been deleted successfully by ${req.user.role_id}` 
        });

    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateGenre = async (req, res) => {
    try {
        const { genre_name } = req.body;

        //Find Genre
        const findGenre = await pool.query(`
        SELECT * FROM "genre"
        WHERE genre_id = $1
        `, [req.params.id]
        );

        const genre = findGenre.rows[0];

        //Check if Genre exists
        if (!genre) {
            return res.status(404).json({
                error: "Genre not found"
            });
        }

        const roles = await pool.query(
            `SELECT * FROM "role"
            WHERE role_name = 'DEV' or role_name = 'ADMIN'`,
        )

        const role = roles.rows;

        //Check ownership
        if (req.user.role_id !== role[0].role_id &&  req.user.role_id !== role[1].role_id) {
            return res.status(403).json({
                error: `${req.user.role_id} Not allowed`
            });
        }

        //Update

        const query = await pool.query(`UPDATE "genre" SET genre_name=$1 WHERE genre_id = $2 RETURNING *`,[genre_name, req.params.id]);

        res.status(200).json({
            status: "success",
            data: {
                Genre: query.rows[0],
            }
        });
    } catch (error) {
        console.error("Update error", error);
        res.status(500).json({error: "Internal server error"});

    }
}

const getGenres = async (req, res)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM "genre"`
        );

        const genres = result.rows;
        //Check item exists
        if(genres.length === 0){
            return res.status(200).json({message: "No Genre"});
        }

        res.status(200).json({
            data:{
                genres,
            }
        });


    } catch (error) {
        console.error("GET Genre error", error);
        res.status(500).json({
            error:"Internal Server error"
        });
    }
}

export { addGenre, deleteGenre, updateGenre, getGenres };