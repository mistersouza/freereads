/**
 * Default error messages for common error scenarios across the application.
 */
const DEFAULT_ERROR_MESSAGES = {
    CAST_ERROR: 'Hmm… this ID seems off. It doesn\'t match any records',
    NOT_FOUND: '404 vibes—this one\'s gone missing!',
    SERVER_ERROR: 'Bookkeeper\'s out! Please knock again later.',
};

/**
 * Authentication and authorization error messages
 */
const AUTH_ERROR_MESSAGES = {
    EMAIL_IN_USE: 'We\'ve seen you before! Try logging in instead.',
    UNKNOWN_USER: 'No luck! That username\'s off the grid. Try registering instead.',
    INVALID_CREDENTIALS: 'Something\'s off with that email or password. Give it another go!',
    ACCESS_DENIED: 'Hold up! You\'re not cleared for this.'
};

/**
 * JSON Web Tokens error messages
 */
const JWT_ERROR_MESSAGES = {
    TOKEN_MISSING: 'Token\'s ghosted. Time for a new one!',
    EXPIRED_TOKEN: 'Token\'s expired. Time for a fresh one!',
    INVALID_TOKEN: 'Token trouble! It\'s off.',
};

/**
 * User error messages
 */
const USER_ERROR_MESSAGES = {
    USER_NOT_FOUND: 'We looked everywhere, but that user\'s MIA',
};

export { 
    DEFAULT_ERROR_MESSAGES,
    AUTH_ERROR_MESSAGES,
    JWT_ERROR_MESSAGES,
    USER_ERROR_MESSAGES };
