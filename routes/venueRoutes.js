import express from 'express';
import { getVenues, getVenuesBySport, getVenueById, getUnclaimedVenues, claimVenue, getNearbyVenues } from '../controllers/venueController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/nearby', getNearbyVenues);
router.get('/unclaimed', getUnclaimedVenues);
router.get('/', getVenues);
router.get('/sport/:sport', getVenuesBySport);
router.post('/claim', protect, upload.single('cnicFile'), claimVenue);
router.get('/:id', getVenueById);

export default router;
