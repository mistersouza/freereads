import { validationResult } from 'express-validator';
import { InputValidationError } from '../services/error/classes/index.js';
import { getResourceName, getInputErrors } from '../services/error/utils.js';
import { log } from '../services/error/index.js';
import { 
  bookRules,
  hubRules,
  scanRules,
  userRules
} from '../validations/index.js';

/**
 * A dynamic factory to validate user input with custom express-validator rules.
 * 
 * @param {Array} rules - An array of validation rules to be executed on the request
 * @returns {Function} Express middleware function
 */
const validate = (rules) => async (request, response, next) => {
  try {
    await Promise.all(rules.map((rule) => rule.run(request)));

    const errors = validationResult(request);
    if (errors.isEmpty()) {
      return next();
    }

    const { 
      requiredFields, 
      isFieldError, 
      formatErrors, 
      isFormatError 
    } = getInputErrors(errors.array());
    
    if (isFieldError) {
      return next(InputValidationError.requiredField(
        getResourceName(request),
        requiredFields
      ));
    }
    
    if (isFormatError) {
      return next(InputValidationError.invalidFormat(
        getResourceName(request),
        formatErrors
      ));
    }

  } catch (error) {
    log.error(error);
    next(error);
  }
};

/**
 * Validate user email and password with precision.
 */
const validateMember = validate([userRules.email, userRules.password]);

/**
 * Validate book scanning image URL or ISBN inputs, or both, with accuracy.
 */
const validateScan = validate([scanRules.imageUrl, scanRules.isbn, scanRules.check]);

/**
 * Master book input validation with laser-sharp accuracy.
 */
const validateBook = validate([bookRules.title, bookRules.author, bookRules.hubs]);

export { validateMember, validateScan, validateBook };