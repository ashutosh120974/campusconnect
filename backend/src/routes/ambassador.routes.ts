import { Router } from 'express';
import * as ambassadorController from '../controllers/ambassador.controller.js';

const router = Router();

router.get('/', ambassadorController.listAmbassadors);
router.get('/top', ambassadorController.getTopAmbassadors);
router.get('/:id', ambassadorController.getAmbassador);

export default router;
