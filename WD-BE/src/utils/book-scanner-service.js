import vision from '@google-cloud/vision';
import ApiError from '../errors/api-error.js';
import { ENV } from '../config/env.js';

/**
 * Creates a new client for Google Cloud Vision API.
 * @returns {Object} - The client object.
 * @throws {Error} - If the client cannot be created.
 * @see https://cloud.google.com/vision/docs/reference/libraries#client-libraries-install-nodejs
 */
const client = new vision.ImageAnnotatorClient({
    keyFilename: ENV.GOOGLE_CREDENTIALS,
});

/**
 * Scans an image for an ISBN.
 * @param {string} imageUrl - The URL of the image to scan.
 * @returns {Promise<string|null>} - The ISBN number, or null if not found.
 * @throws {Error} - If the image cannot be scanned.
 * @see https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate
 */
const scanForISBN = async (imageUrl) => {
    try {
        const [result] = await client.textDetection(imageUrl);
        const { text } = result.fullTextAnnotation;
        
         const isbnMatch = text.match(/ISBN\s*([\d-]{10,17})/i);
         const isbn = isbnMatch ? isbnMatch[1] : null;
         return isbn;
    } catch (error) {
        console.error('Error scanning image for ISBN:', error);
        return null;
    }   
};

/**
 * Fetches book details from Google Books API.
 * @param {string} isbn - The ISBN number of the book.
 * @returns {Promise<Object|null>} - The book details, or null if not found.
 * @throws {Error} - If the book details cannot be fetched.
 * @see https://developers.google.com/books/docs/v1/reference/volumes/list
 */
const fetchBookDetails = async (isbn) => {
    if (!isbn) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
            { signal: controller.signal }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            throw new ApiError(
                'Something went sideways. Try again',
                response.status
            );
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) return null;        
        
        const { volumeInfo } = data.items[0];
        
        if (!volumeInfo) return null;
        
        const { title, authors, publishedDate, imageLinks } = volumeInfo;

        const bookPayload = {
            isbn,
            title: title,
            author: authors?.[0] || 'Anonymous Wordsmith',
            releaseYear: publishedDate?.split("-")[0] || "Unknown Era",
            thumbnail: imageLinks?.thumbnail || imageLinks?.smallThumbnail
        };
        return bookPayload;
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

export { scanForISBN, fetchBookDetails };