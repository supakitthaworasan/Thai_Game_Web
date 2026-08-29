import express from 'express';
import { addMovie, deleteMovie, getMovie, updateMovie } from '../controller/movieController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import  {addMovieSchema} from '../validators/movieValidator.js'

const router = express.Router();
router.use(authMiddleware);

router.get("/getMovie", getMovie);

router.post("/addMovie", validateRequest(addMovieSchema), addMovie);

router.put("/update/:id", updateMovie);

router.delete("/delete/:id", deleteMovie);

export default router;