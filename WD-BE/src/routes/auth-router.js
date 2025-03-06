import { Router } from 'express';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { AUTH_ERROR_MESSAGES } from '../errors/index.js';
import { register, login } from '../controllers/auth-controller.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication API (v1)
 */

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.use(normalizeError(AUTH_ERROR_MESSAGES));

export default router;