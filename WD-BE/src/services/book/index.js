import { scanForISBN,  } from './book-scanner.js';
import { isbnLookup } from './isbnLookup.js';

/**
 * Initializes the scanner service
 * @returns {Object} Scanner service functions
 */
const initializeBookFinder = () => {
    return {
        scanForISBN,
        isbnLookup
    };
}

export { initializeBookFinder };