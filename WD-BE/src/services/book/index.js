import Book from '../../models/book-model.js';
import { initializeModelOps } from '../model/index.js';
import { updateOrInsert } from './upsert.js';
import { scanForISBN } from './book-scanner.js';
import { isbnLookup } from './isbnLookup.js';

/**
 * Boots up the book service
 *
 * @returns {Object} Book service functions
 */
const initializeBookService = () => {
  const ops = initializeModelOps(Book, 'books');
  return {
    ...ops,
    updateOrInsert,
    scanForISBN,
    isbnLookup,
  };
};

export { initializeBookService };
