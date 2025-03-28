import { Router } from 'express';
import { register, login } from '../controllers/auth-controller.js';
import { AUTH_ERROR_MESSAGES } from '../services/error/constants.js';
import { validateMember } from '../middlewares/validate-middleware.js';
import { handleError } from '../services/error/handler.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication API (v1)
 */
const router = Router();

router.use(validateMember);

router.post('/register', register);
router.post('/login', login);

router.use(handleError(AUTH_ERROR_MESSAGES));

export default router;