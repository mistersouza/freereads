import { Router } from 'express';
import { register, login, logout } from '../controllers/auth-controller.js';
import { validateMember } from '../middlewares/validate-middleware.js';

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
router.post('/logout', logout);

export default router;