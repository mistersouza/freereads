import { ApiError, log } from '../../errors/index.js';

/**
 * Grabs book details from the Google Books API.
 * 
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

        if (!response.ok) {
            throw new ApiError(
                response.status,
                'Something went sideways. Try again'
            );
        }

        const data = await response.json();   

        return data.items?.[0]?.volumeInfo 
            ? {
                isbn,
                title: data.items[0].volumeInfo.title,
                author: data.items[0].volumeInfo.authors?.[0] || 'Anonymous Wordsmith',
                releaseYear: data.items[0].volumeInfo.publishedDate?.split("-")[0] || "Unknown Era",
                thumbnail: data.items[0].volumeInfo.imageLinks?.thumbnail || data.items[0].volumeInfo.imageLinks?.smallThumbnail
            } 
            : null;
    } catch (error) {
        log.error(error);
        return null;
    } finally {
        clearTimeout(timeout);
    }
};

export { isbnLookup };