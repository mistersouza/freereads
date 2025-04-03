import { Router } from 'express';
import { scanBook } from '../controllers/scan-controller.js';
import { validateScan } from '../middlewares/validate-middleware.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book scanning and management API
 */
const router = Router();

router.post('/scan', validateScan, scanBook);

export default router;