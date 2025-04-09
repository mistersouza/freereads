import { Router } from 'express';
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

export default router;
