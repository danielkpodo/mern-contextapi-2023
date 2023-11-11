import { login, register, updateUser } from '../controllers/authController.js';

//verification token
import authenticateUser from '../middleware/auth.js';
import express from 'express';
import rateLimiter from 'express-rate-limit';

const router = express.Router();

/** Setup Rate Limiting */
const apiLimiter = rateLimiter({
  windowMs: 1000 * 60 * 15, // 15miutes
  max: 10, // 10 requests max in 15minutes
  message: 'Too many requests from this IP, try again after 15minutes',
});

router.route('/register').post(apiLimiter, register);
router.route('/login').post(apiLimiter, login);
router.route('/updateUser').patch(authenticateUser, updateUser);

export default router;
