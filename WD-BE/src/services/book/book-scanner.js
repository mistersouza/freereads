import vision from '@google-cloud/vision';
import { ENV } from '../../config/env.js';

/**
 * Creates a new client for Google Cloud Vision API.
 *
 * @returns {Object} - The client object.
 * @throws {Error} - If the client cannot be created.
 * @see https://cloud.google.com/vision/docs/reference/libraries#client-libraries-install-nodejs
 */
const client = new vision.ImageAnnotatorClient({
  keyFilename: ENV.GOOGLE_CREDENTIALS,
});

/**
 * Scans an image for an ISBN.
 *
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

export { scanForISBN };
