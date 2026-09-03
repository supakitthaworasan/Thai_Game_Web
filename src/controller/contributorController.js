import { json } from 'express';
import { pool } from '../config/db.js';

const addgame_contributor = async (req, res) => {

    try {
        const { contributor_name, img_icon_url, website_url} = req.body;

        // Check if game_contributor already exists
        const existinggame_contributor = await pool.query(
            `SELECT contributor_id from "game_contributor"
            WHERE contributor_name = $1`, [contributor_name]
        );

        if (existinggame_contributor.rows.length > 0) {
            return res.status(400).json({
                error: "game_contributor already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO "game_contributor" (contributor_name, img_icon_url, website_url)
            VALUES($1, $2, $3)
            RETURNING contributor_id, contributor_name, img_icon_url, website_url`,
            [contributor_name, img_icon_url, website_url]
        );

        const added_game_contributor = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data: {
                game_contributor: {
                    id: added_game_contributor.contributor_id,
                    contributor_name: added_game_contributor.contributor_name,
                    img_icon_url: added_game_contributor.img_icon_url,
                    website_url: added_game_contributor.website_url
                }
            }
        });


    } catch (error) {
        console.error("addgame_contributor error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }

};

const deletegame_contributor = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "game_contributor"
            WHERE contributor_id = $1`, [req.params.id],
        );

        const roles = await pool.query(
            `SELECT * FROM "role"
            WHERE role_name = 'DEV' or role_name = 'ADMIN'`,
        )

        const role = roles.rows; 

        const game_contributorItem = result.rows[0];

        //Check if game_contributor exists
        if (!game_contributorItem) {
            return res.status(404).json({ error: "game_contributor not found" });
        }

        //ensure only owner can delete
        if (req.user.role_id !== role[0].role_id && req.user.role_id !== role[1].role_id ) {
            return res.status(403).json({
                error: `Role ${req.user.role_id} Not allowed to delete`
            })
        }

        await pool.query(`
            DELETE FROM "game_contributor"
            WHERE contributor_id = $1`, [req.params.id]);

        res.status(200).json({
            message: `game_contributor has been deleted successfully by ${req.user.role_id}` 
        });

    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updategame_contributor = async (req, res) => {
    try {
        const { contributor_name, img_icon_url, website_url } = req.body;

        //Find game_contributor
        const findgame_contributor = await pool.query(`
        SELECT * FROM "game_contributor"
        WHERE contributor_id = $1
        `, [req.params.id]
        );

        const game_contributor = findgame_contributor.rows[0];

        //Check if game_contributor exists
        if (!game_contributor) {
            return res.status(404).json({
                error: "game_contributor not found"
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

        if (contributor_name !== undefined) updateData.contributor_name = contributor_name;
        if (img_icon_url !== undefined) updateData.img_icon_url = img_icon_url;
        if (website_url !== undefined) updateData.website_url = website_url;
        
 

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


        const query = await pool.query(`UPDATE "game_contributor" SET ${fields.join(",")} WHERE contributor_id = $${index} RETURNING *`, values);

        res.status(200).json({
            status: "success",
            data: {
                game_contributor: query.rows[0],
            }
        });
    } catch (error) {
        console.error("Update error", error);
        res.status(500).json({error: "Internal server error"});

    }
}

const getgame_contributors = async (req, res)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM "game_contributor"`
        );

        const game_contributors = result.rows;
        //Check item exists
        if(game_contributors.length === 0){
            return res.status(200).json({message: "No game_contributor"});
        }

        res.status(200).json({
            data:{
                game_contributors,
            }
        });


    } catch (error) {
        console.error("GET game_contributor error", error);
        res.status(500).json({
            error:"Internal Server error"
        });
    }
}

export { addgame_contributor, deletegame_contributor, updategame_contributor, getgame_contributors };