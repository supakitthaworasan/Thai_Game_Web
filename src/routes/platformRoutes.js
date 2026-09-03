import express from 'express';
import { addPlatform, getPlatforms, updatePlatform, deletePlatform } from '../controller/platformController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import  {addGameSchema} from '../validators/gameValidator.js'

const router = express.Router();
router.use(authMiddleware);

router.get("/getPlatform", getPlatforms);

router.post("/addPlatform", addPlatform);

router.put("/update/:id", updatePlatform);

router.delete("/delete/:id", deletePlatform);

export default router;