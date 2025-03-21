import ApiError from '../../errors/api-error.js';
import { log } from '../../errors/index.js';

/**
 * Fetches book details from Google Books API.
 * @param {string} isbn - The ISBN number of the book.
 * @returns {Promise<Object|null>} - The book details, or null if not found.
 * @throws {Error} - If the book details cannot be fetched.
 * @see https://developers.google.com/books/docs/v1/reference/volumes/list
 */
const isbnLookup = async (isbn) => {
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
        log.error(error);
        return null;
    }
};

export { isbnLookup };