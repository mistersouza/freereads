/**
 * @fileoverview Centralized error messages for consistent user-friendly errors.
 * Each category contains domain-specific error messages with friendly, conversational tone.
 */

/**
 * Default error messages for common error scenarios across the application.
 * @type {Object.<string, string>}
 */
const DEFAULT_ERROR_MESSAGES = {
    CAST_ERROR: 'Hmm… this ID seems off. It doesn\'t match any records',
    NOT_FOUND: '404 vibes—this one\'s gone missing!',
    SERVER_ERROR: 'Bookkeeper\'s out! Please knock again later.',
};

/**
 * Authentication and authorization error messages
 * @type {Object.<number|string, string>}
 */
const AUTH_ERROR_MESSAGES = {
    401: 'Something\'s off with that email or password. Give it another go!',
    403: 'Hold up! You\'re not cleared for this.',
    404: 'No luck! That username\'s off the grid. Try registering instead.',
    409: 'We\'ve seen you before! Try logging in instead.'
};

/**
 * User error messages
 * @type {Object.<number|string, string>}
 */
const USER_ERROR_MESSAGES = {
    404: 'This book seems to have vanished from our shelves!',
};

/**
 * Book error messages
 * @type {Object.<number|string, string>}
 */
const BOOK_ERROR_MESSAGES = {
    404: 'This book seems to have vanished from our shelves!',
};

/**
 * Scanning error messages
 * @type {Object.<number|string, string>}
 */
const SCAN_ERROR_MESSAGES = {
    400: 'Book cover missing! Try scanning again.',
    404: 'Oops! We couldn\'t find that book. Do you wanna try again?',
    422: 'Oops! We couldn\'t quite get what need. Try scanning another image.',
};

export { 
    DEFAULT_ERROR_MESSAGES,
    AUTH_ERROR_MESSAGES,
    SCAN_ERROR_MESSAGES,
    USER_ERROR_MESSAGES,
    BOOK_ERROR_MESSAGES,};
