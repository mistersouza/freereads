import { BusinessValidationError } from '../services/error/classes/index.js';
import { getResourceName, log } from '../services/error/index.js';

/**
 * @swagger
 * /scan:
 *   post:
 *     summary: Scan a book by ISBN or image
 *     description: Gets book details via ISBN input or image with ISBN
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isbn:
 *                 type: string
 *                 description: ISBN number of the book (either ISBN-10 or ISBN-13)
 *                 example: "9780451524935"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL of an image containing an ISBN barcode
 *                 example: "https://example.com/book-cover.jpg"
 *             oneOf:
 *               - required: [isbn]
 *               - required: [imageUrl]
 *     responses:
 *       200:
 *         description: Book details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isbn:
 *                   type: string
 *                   description: ISBN of the book
 *                 title:
 *                   type: string
 *                   description: Title of the book
 *                 author:
 *                   type: string
 *                   description: Author of the book
 *                 releaseYear:
 *                   type: string
 *                   description: Year the book was published
 *                 thumbnail:
 *                   type: string
 *                   format: uri
 *                   description: URL to the book cover image
 *             example:
 *               isbn: "9780451524935"
 *               title: "1984"
 *               author: "George Orwell"
 *               releaseYear: "1949"
 *               thumbnail: "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/BusinessError'
 *       422:
 *         description: Unable to process the image or invalid ISBN
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/BusinessError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * Pulls book details by ISBN using the app’s book service.
 *
 * @param {string} isbn - The ISBN of the book to look up.
 * @param {Object} request - The Express request object containing app context and services.
 * @returns {Promise<Object>} The book details if found.
 * @throws {BusinessValidationError} If the book is not found.
 */
const fetchBookDetails = async (isbn, request) => {
  const bookDetails = await request.app.locals.services.book.isbnLookup(isbn);
  if (!bookDetails) {
    throw BusinessValidationError.notFound(getResourceName(request));
  }
  return bookDetails;
};

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

    if (isbn) {
      const bookDetails = await fetchBookDetails(isbn, request);
      return response.status(200).json(bookDetails);
    }
    // Fallback on the paid service last
    const scannedIsbn = await request.app.locals.services.book.scanForISBN(imageUrl);
    if (!scannedIsbn) {
      return next(BusinessValidationError.unprocessableEntity(getResourceName(request)));
    }

    const bookDetails = await fetchBookDetails(scannedIsbn, request);
    return response.status(200).json(bookDetails);
  } catch (error) {
    log.error(error);
    return next(error);
  }
};

export { scanBook };
