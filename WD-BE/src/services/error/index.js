import {
  ApiError,
  BusinessValidationError,
  InputValidationError,
  JwtError,
} from './classes/index.js';
import { log } from './logger.js';
import { handleError } from './handler.js';
import { getResourceName, getInputErrors } from './utils.js';
import { DOMAIN_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGES } from './constants.js';

export {
  // Error classes
  ApiError,
  BusinessValidationError,
  InputValidationError,
  JwtError,

  // Handler
  handleError,

  // Utils
  getResourceName,
  getInputErrors,

  // Logger
  log,

  // Constants
  DOMAIN_ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGES,
};
