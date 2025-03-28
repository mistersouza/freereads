import { BusinessValidationError } from '../services/error/classes/index.js';
import { 
  ApiError,
  getResourceName,
  log 
} from '../errors/index.js';

/*
 * Grab book details by scanning its ISBN
 * 
 * @param {Object} request - Express request object containing book scan details
 * @param {Object} response - Express response object for sending book details
 * @param {Function} next - Express next middleware function for error handling
 * @returns {Object} Book details with 200 status code or passes error to next middleware
 */
const scanBook = async (request, response, next) => {
  try {
    const { imageUrl, isbn } = request.body;

    const fetchBookDetails = async (isbn) => {
      const bookDetails = await request.app.locals.services.book.isbnLookup(isbn);
      if (!bookDetails) {
        throw BusinessValidationError.notFound(getResourceName(request));
      }
      return bookDetails;
    };

    if (isbn) {
      const bookDetails = await fetchBookDetails(isbn);
      return response.status(200).json(bookDetails);
    }

    // Fallback on the paid service last 
    const scannedIsbn = await request.app.locals.services.book.scanForISBN(imageUrl);
    if (!scannedIsbn) {
      throw BusinessValidationError.unprocessableEntity(getResourceName(request));
    }

    const bookDetails = await fetchBookDetails(scannedIsbn);
    return response.status(200).json(bookDetails);
  } catch (error) {
    log.error(error);
    next(error);
  }
};

export { scanBook };