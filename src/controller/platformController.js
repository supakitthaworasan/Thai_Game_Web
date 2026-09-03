import { json } from 'express';
import { pool } from '../config/db.js';

const addPlatform = async (req, res) => {

    try {
        const { platform_name} = req.body;

        // Check if platform already exists
        const existingplatform = await pool.query(
            `SELECT platform_id from "platform"
            WHERE platform_name = $1`, [platform_name]
        );

        if (existingplatform.rows.length > 0) {
            return res.status(400).json({
                error: "platform already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO "platform" (platform_name)
            VALUES($1)
            RETURNING platform_id, platform_name`,
            [platform_name]
        );

        const added_platform = result.rows[0];

        // Send back result
        res.status(201).json({
            status: "success",
            data: {
                platform: {
                    id: added_platform.platform_id,
                    platform_name: added_platform.platform_name,
                    
                }
            }
        });


    } catch (error) {
        console.error("addplatform error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }

};

const deletePlatform = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "platform"
            WHERE platform_id = $1`, [req.params.id],
        );

        const roles = await pool.query(
            `SELECT * FROM "role"
            WHERE role_name = 'DEV' or role_name = 'ADMIN'`,
        )

        const role = roles.rows; 

        const platformItem = result.rows[0];

        //Check if platform exists
        if (!platformItem) {
            return res.status(404).json({ error: "platform not found" });
        }

        //ensure only owner can delete
        if (req.user.role_id !== role[0].role_id && req.user.role_id !== role[1].role_id ) {
            return res.status(403).json({
                error: `Role ${req.user.role_id} Not allowed to delete`
            })
        }

        await pool.query(`
            DELETE FROM "platform"
            WHERE platform_id = $1`, [req.params.id]);

        res.status(200).json({
            message: `platform ${req.params.id} has been deleted successfully by ${req.user.role_id}` 
        });

    } catch (error) {
        console.error("Delete error", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updatePlatform = async (req, res) => {
    try {
        const { platform_name } = req.body;

        //Find platform
        const findplatform = await pool.query(`
        SELECT * FROM "platform"
        WHERE platform_id = $1
        `, [req.params.id]
        );

        const platform = findplatform.rows[0];

        //Check if platform exists
        if (!platform) {
            return res.status(404).json({
                error: "platform not found"
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

        const query = await pool.query(`UPDATE "platform" SET platform_name=$1 WHERE platform_id = $2 RETURNING *`,[platform_name, req.params.id]);

        res.status(200).json({
            status: "success",
            data: {
                platform: query.rows[0],
            }
        });
    } catch (error) {
        console.error("Update error", error);
        res.status(500).json({error: "Internal server error"});

    }
}

const getPlatforms = async (req, res)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM "platform"`
        );

        const platforms = result.rows;
        //Check item exists
        if(platforms.length === 0){
            return res.status(200).json({message: "No platform"});
        }

        res.status(200).json({
            data:{
                platforms,
            }
        });


    } catch (error) {
        console.error("GET platform error", error);
        res.status(500).json({
            error:"Internal Server error"
        });
    }
}

export { addPlatform, deletePlatform, updatePlatform, getPlatforms };