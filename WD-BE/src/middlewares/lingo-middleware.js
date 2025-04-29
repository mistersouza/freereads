import { log } from '../services/error/index.js';
import { supportedLanguages, defaultLanguage } from '../config/i18n.js';

/**
 * Sets the user's locale from the 'Accept-Language' header/ defaults to English
 *
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 */
const setLingo = (request, response, next) => {
  const languageCode = request.headers['accept-language']?.split(',')?.[0]?.trim();
  const locale = languageCode?.split('-')?.[0]?.toLowerCase() || defaultLanguage;

  const isLanguageSupported = supportedLanguages.includes(locale);
  request.locale = isLanguageSupported ? locale : 'en';
  response.set('Content-Language', request.locale);
  log.info(`Locale set to ${request.locale}`);

  if (!isLanguageSupported) {
    log.warn(`No ${locale} support. Defaulting to 'en'.`);
  }

  next();
};

export { setLingo };
