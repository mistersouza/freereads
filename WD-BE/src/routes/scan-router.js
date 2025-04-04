import { Router } from 'express';
import { scanBook } from '../controllers/scan-controller.js';
import { validateScan } from '../middlewares/validate-middleware.js';
import { SCAN_ERROR_MESSAGES } from '../services/error/constants.js';
import { handleError } from '../services/error/handler.js'

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book scanning and management API
 */
const router = Router();

router.post('/scan', validateScan, scanBook);

// Error handling middleware
router.use(handleError(SCAN_ERROR_MESSAGES));

export default router;