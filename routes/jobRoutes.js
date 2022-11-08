import express from 'express';
import {
  createJob,
  deleteJob,
  getAllJob,
  getJob,
  showStats,
  updateJob,
} from '../controllers/jobController.js';

const router = express.Router();

router.route('/').post(createJob).get(getAllJob);
// Always put the strings first before the :id
router.route('/stats').get(showStats);
router.route('/:id').delete(deleteJob).patch(updateJob).get(getJob);

export default router;
