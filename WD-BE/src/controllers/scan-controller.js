import { scanForISBN, fetchBookDetails } from '../utils/book-scanner-service.js';
import ApiError from '../errors/api-error.js';
/**
 * Scans an image for an ISBN and fetches book details.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the scan is complete.
 * @throws {ApiError} - If the scan fails.
 */
const scanBook = async (req, res, next) => {
    const { imageUrl } = req.body;
    try {
        if (!imageUrl) {
            throw new ApiError(
                'Book cover missing! Try scanning again.',
                400
            );
        }

        const isbn = await scanForISBN(imageUrl);
        
        if (!isbn) {
            throw new ApiError(
                'Oops! We couldn\'t quite get what need. Try scanning another image.',
                404
            );
        }

        const bookDetails = await fetchBookDetails(isbn);
        if (!bookDetails) {
            throw new ApiError(
                'Oops! We couldn\'t find that book. Do you wanna try again?',
                404
            );
        }
        res.status(200).json(bookDetails);
    } catch (error) {
        next(error);
    }
}

export { scanBook };
