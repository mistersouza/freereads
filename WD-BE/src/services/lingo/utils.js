import i18n from 'i18n';
import { defaultLanguage } from '../../config/i18n.js';

// eslint-disable-next-line no-underscore-dangle
const __t = i18n.__;

/**
 * Localize this message
 *
 * @param {string} message - The message to translate
 * @param {string} locale - The locale to use for translation
 * @returns {string} Translated message
 */
const translateMessage = (phrase, locale) => {
  if (locale === defaultLanguage) return phrase;
  return __t({ phrase, locale });
};

/**
 * Localize form field messages
 *
 * @param {Object} fields - Object mapping field names to messages
 * @param {string} locale - The locale to use for translation
 * @returns {Object} Translated field-specific messages
 */
const translateFieldMessages = (fields, locale) => {
  if (locale === defaultLanguage) return fields;
  return Object.fromEntries(
    Object.entries(fields).map(([field, message]) => [
      field,
      translateMessage(message, locale),
    ]),
  );
};

export { translateMessage, translateFieldMessages };
