import express from 'express';
import { addMovie } from '../controller/movieController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post("/addMovie", addMovie);

export default router;