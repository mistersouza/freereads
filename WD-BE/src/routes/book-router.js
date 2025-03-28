import { Router } from 'express';
import { BOOK_ERROR_MESSAGES } from '../services/error/constants.js';
import { handleError } from '../services/error/handler.js';
import {
    getBooks,
    getBook,
    updateOrInsertBook,
    deleteBook,
} from '../controllers/book-controller.js';

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management API (v1)
 */
const router = Router();

router.route('/')
    .get(getBooks)
    .put(updateOrInsertBook);

router.route('/:id')
    .get(getBook)
    .delete(deleteBook);

// Error handling middleware
router.use(handleError(BOOK_ERROR_MESSAGES));

export default router;