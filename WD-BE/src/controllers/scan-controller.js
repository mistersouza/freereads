import ApiError from '../errors/api-error.js';
import { getResourceName } from '../errors/index.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     BookScanRequest:
 *       type: object
 *       required:
 *         - imageUrl
 *       properties:
 *         imageUrl:
 *           type: string
 *           description: URL of the book cover image to scan
 *           example: "https://example.com/book-cover.jpg"
 *     BookDetails:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the book
 *         author:
 *           type: string
 *           description: Author of the book
 *         isbn:
 *           type: string
 *           description: ISBN of the book
 *         publisher:
 *           type: string
 *           description: Publisher of the book
 *         publishedDate:
 *           type: string
 *           description: Publication date
 *         description:
 *           type: string
 *           description: Book description
 *         pageCount:
 *           type: integer
 *           description: Number of pages in the book
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           description: Book categories/genres
 *         imageLinks:
 *           type: object
 *           properties:
 *             thumbnail:
 *               type: string
 *               description: URL to book cover thumbnail
 *       example:
 *         title: "The Great Gatsby"
 *         author: "F. Scott Fitzgerald"
 *         isbn: "9780743273565"
 *         publisher: "Scribner"
 *         publishedDate: "2004-09-30"
 *         description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald."
 *         pageCount: 180
 *         categories: ["Fiction", "Classics"]
 *         imageLinks:
 *           thumbnail: "http://books.google.com/books/content?id=iXn5U2IzVH0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
 */

/**
 * @swagger
 * /api/v1/scan:
 *   post:
 *     summary: Scan a book
 *     description: Endpoint to scan book information from an image URL. The image is processed to detect an ISBN, which is then used to fetch book details.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Book cover missing! Try scanning again."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       404:
 *         description: Book not found or ISBN not detected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Oops! We couldn't find that book. Do you wanna try again?"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       422:
 *         description: Unprocessable entity - Could not extract data from image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *                   example: "Oops! We couldn't quite get what need. Try scanning another image."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 */
const scanBook = async (request, response, next) => {
    try {
        const { imageUrl } = request.body;
        const { services } = request.app.locals;

        if (!imageUrl) {
            throw new ApiError(
                400, 
                getResourceName(request),
            );
        }

        const isbn = await services.scanForISBN(imageUrl);
        if (!isbn) {
            throw new ApiError(
                422, 
                getResourceName(request),
            );
        }

        const bookDetails = await services.isbnLookup(isbn);
        if (!bookDetails) {
            throw new ApiError(
                404, 
                getResourceName(request),
            );
        }
        response.status(200).json(bookDetails);
    } catch (error) {
        next(error);
    }
};

export { scanBook };