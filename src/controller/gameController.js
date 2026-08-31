import { json } from 'express';
import { pool } from '../config/db.js';

const addGame = async (req, res) => {

    try {
        const { game_name, img_game_url, description, price, release_date, publisher_id, developer_id, download_url} = req.body;

        // Check if game already exists
        const existinggame = await pool.query(
            `SELECT game_id from "game"
            WHERE game_name = $1`, [game_name]
        );

        if (existinggame.rows.length > 0) {
            return res.status(400).json({
                error: "Game already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO "game" (game_name, img_game_url, description, price, release_date, publisher_id, developer_id, download_url)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING game_id, game_name, img_game_url, description, price, release_date, publisher_id, developer_id, download_url`,
            [game_name, img_game_url, description, price, release_date, publisher_id, developer_id, download_url]
        );

        const added_game = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data: {
                game: {
                    id: added_game.game_id,
                    game_name: added_game.game_name,
                    img_game_url: added_game.img_game_url,
                    description: added_game.description,
                    price: added_game.price,
                    release_date: added_game.release_date,
                    publisher_id: added_game.publisher_id,
                    developer_id: added_game.developer_id,
                    download_url: added_game.download_url,
                }
            }
        });


    } catch (error) {
        console.error("addGame error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }

};

const deleteGame = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "game"
            WHERE game_id = $1`, [req.params.id],
        );

        const roles = await pool.query(
            `SELECT * FROM "role"
            WHERE role_name = 'DEV' or role_name = 'ADMIN'`,
        )

        const role = roles.rows; 

        const gameItem = result.rows[0];

        if (!gameItem) {
            return res.status(404).json({ error: "Game not found" });
        }

        //ensure only owner can delete
        if (req.user.role_id !== role[0].role_id && req.user.role_id !== role[1].role_id ) {
            return res.status(403).json({
                error: `Role ${req.user.role_id} Not allowed to delete`
            })
        }

        await pool.query(`
            DELETE FROM "game"
            WHERE game_id = $1`, [req.params.id]);

        res.status(200).json({
            message: `Game has been deleted successfully by ${req.user.role_id}` 
        });

    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateGame = async (req, res) => {
    try {
        const { game_name, img_game_url, description, price, release_date, publisher_id, developer_id, download_url } = req.body;

        //Find game
        const findgame = await pool.query(`
        SELECT * FROM "game"
        WHERE game_id = $1
        `, [req.params.id]
        );

        const game = findgame.rows[0];

        //Check if game exists
        if (!game) {
            return res.status(404).json({
                error: "game not found"
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
        const updateData = {};

        if (game_name !== undefined) updateData.game_name = game_name;
        if (img_game_url !== undefined) updateData.img_game_url = img_game_url;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (release_date !== undefined) updateData.release_date = release_date;
        if (publisher_id !== undefined) updateData.publisher_id = publisher_id;
        if (developer_id !== undefined) updateData.developer_id = developer_id;
        if (download_url !== undefined) updateData.download_url = download_url;
 

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


        const query = await pool.query(`UPDATE "game" SET ${fields.join(",")} WHERE game_id = $${index} RETURNING *`, values);

        res.status(200).json({
            status: "success",
            data: {
                game: query.rows[0],
            }
        });
    } catch (error) {
        console.error("Update error", error);
        res.status(500).json({error: "Internal server error"});

    }
}

const getGames = async (req, res)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM "game"`
        );

        const games = result.rows;
        //Check item exists
        if(games.length === 0){
            return res.status(200).json({message: "No game"});
        }

        res.status(200).json({
            data:{
                games,
            }
        });


    } catch (error) {
        console.error("GET game error", error);
        res.status(500).json({
            error:"Internal Server error"
        });
    }
}

export { addGame, deleteGame, updateGame, getGames };