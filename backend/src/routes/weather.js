import { Router } from 'express';
import { getWeatherByQuery } from '../controllers/widgetsController.js';

const router = Router();

router.get('/', getWeatherByQuery);

export default router;


