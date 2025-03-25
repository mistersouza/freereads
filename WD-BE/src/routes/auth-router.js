import { Router } from 'express';
import { register, login } from '../controllers/auth-controller.js';
import { normalizeError, AUTH_ERROR_MESSAGES } from '../errors/index.js';
import { validateMember } from '../middlewares/validate-middleware.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication API (v1)
 */
const router = Router();

router.post('/register', validateMember, register);
router.post('/login', validateMember, login);

// Error handling middleware
router.use(normalizeError(AUTH_ERROR_MESSAGES));

export default router;