import express from 'express';
import { scanBook } from '../controllers/scan-controller.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book scanning and management API
 */

const router = express.Router();

router.post('/books/scan', scanBook);

export default router;