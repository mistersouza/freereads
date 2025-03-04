import express from 'express';
import { scanBook } from '../controllers/scan-controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/books/scan:
 *   post:
 *     summary: Scan a book
 *     description: Endpoint to scan book information from an image URL
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookScanRequest'
 *     responses:
 *       200:
 *         description: Book successfully scanned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookDetails'
 *       400:
 *         description: Invalid request - Missing image
 *       404:
 *         description: Book not found or ISBN not detected
 *       500:
 *         description: Server error
 */

router.post('/books/scan', scanBook);


export default router;