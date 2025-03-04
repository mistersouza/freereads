import { Router } from 'express';
import errorHandler from '../middlewares/error-handler-middleware.js';
import { register, login } from '../controllers/auth-controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.use(errorHandler());

export default router;