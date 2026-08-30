import express from 'express';
import { addGame, deleteGame, getGames, updateGame } from '../controller/gameController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import  {addGameSchema} from '../validators/gameValidator.js'

const router = express.Router();
router.use(authMiddleware);

router.get("/getGames", getGames);

router.post("/addGame", addGame);

router.put("/update/:id", updateGame);

router.delete("/delete/:id", deleteGame);

export default router;