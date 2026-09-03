import express from 'express';
import { addGenre, getGenres, updateGenre, deleteGenre } from '../controller/genreController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import  {addGameSchema} from '../validators/gameValidator.js'

const router = express.Router();
router.use(authMiddleware);

router.get("/getGenre", getGenres);

router.post("/addGenre", addGenre);

router.put("/update/:id", updateGenre);

router.delete("/delete/:id", deleteGenre);

export default router;