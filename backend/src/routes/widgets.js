import { Router } from 'express';
import {
  listWidgets,
  createWidget,
  deleteWidget,
  getWidgetWeather,
} from '../controllers/widgetsController.js';

const router = Router();

router.get('/', listWidgets);
router.post('/', createWidget);
router.delete('/:id', deleteWidget);
router.get('/:id/weather', getWidgetWeather);

export default router;


