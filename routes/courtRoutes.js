import express from 'express';
import { searchCourts, getCourtSlots } from '../controllers/courtController.js';

const router = express.Router();

router.get('/search', searchCourts);
router.get('/:id/slots', getCourtSlots);

export default router;
