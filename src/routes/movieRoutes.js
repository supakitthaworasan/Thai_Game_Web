import express from 'express';
import { addMovie } from '../controller/movieController.js';

const router = express.Router();

router.post("/addMovie", addMovie);

export default router;