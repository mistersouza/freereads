import express from 'express';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { BOOK_ERROR_MESSAGES } from '../errors/index.js';

import {
    getAllBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
} from '../controllers/book-controller.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management API (v1)
 */
const router = express.Router();

router.route('/')
.get(getAllBooks)
.post(createBook);

router.route('/:id')
    .get(getBook)
    .patch(updateBook)
    .delete(deleteBook);

router.use(normalizeError(BOOK_ERROR_MESSAGES));

export default router;
