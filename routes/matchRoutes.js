import express from 'express';
import { getMatches, createMatch, joinMatch } from '../controllers/matchController.js';

const router = express.Router();

router.get('/', getMatches);
router.post('/', createMatch);
router.put('/:id/join', joinMatch);

export default router;
