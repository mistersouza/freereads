import { Router } from 'express';
import { normalizeError, BOOK_ERROR_MESSAGES } from '../errors/index.js';
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
const router = Router();

router.route('/')
    .get(getAllBooks)
    .post(createBook);

router.route('/:id')
    .get(getBook)
    .patch(updateBook)
    .delete(deleteBook);

// Error handling middleware
router.use(normalizeError(BOOK_ERROR_MESSAGES));

export default router;