import express from 'express';
import { scanBook } from '../controllers/scan-controller.js';

const router = express.Router();

router.post('/books/scan', scanBook);

export default router;