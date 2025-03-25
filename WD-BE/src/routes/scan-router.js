import express from 'express';
import { scanBook } from '../controllers/scan-controller.js';
import { normalizeError, SCAN_ERROR_MESSAGES } from '../errors/index.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book scanning and management API
 */

const router = express.Router();

router.post('/scan', scanBook);

// Error handling middleware
router.use(normalizeError(SCAN_ERROR_MESSAGES));

export default router;
