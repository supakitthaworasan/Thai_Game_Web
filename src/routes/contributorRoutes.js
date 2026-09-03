import express from 'express';
import { addgame_contributor, getgame_contributors, updategame_contributor, deletegame_contributor } from '../controller/contributorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import  {addGameSchema} from '../validators/gameValidator.js'

const router = express.Router();
router.use(authMiddleware);

router.get("/getContributors", getgame_contributors);

router.post("/addContributor", addgame_contributor);

router.put("/update/:id", updategame_contributor);

router.delete("/delete/:id", deletegame_contributor);

export default router;