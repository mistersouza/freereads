import { validationResult } from 'express-validator';
import { userRules, scanRules } from '../validations/validation-rules.js';
import { InputValidationError, getResourceName } from '../errors/index.js';


/**
 * A dynamic factory to validate user input with custom express-validator rules.
 * 
 * This middleware dynamically accepts an array of validation rules, 
 * executes them, and checks for validation errors in the request.
 * If no errors are found, it proceeds to the next middleware; 
 * if errors are found, it throws a custom `InputValidationError`.
 *
 * @param {Array} rules - An array of validation rules to be executed on the request
 * @returns {Function} Express middleware function
 */
const validate = (rules) => async (request, response, next) => {
  await Promise.all(rules.map((rule) => rule.run(request)));

  const errors = validationResult(request);
  if (errors.isEmpty()) {
    return next();
  }

  next(
    new InputValidationError(
      getResourceName(request),
      Object.fromEntries(errors.array().map(({ path, msg }) => [path, msg])),
    ),
  );
};1

/**
 * Validate user email and password with precision.
 * 
 * This middleware uses the dynamic `validate` middleware function
 * and applies specific rules for validating user credentials.
 * 
 * @see userRules.email
 * @see userRules.password
 */
const validateMember = validate([userRules.email, userRules.password]);

/**
 * Validate book scanning image URL or ISBN inputs, or both, with accuracy.
 * 
 * This middleware uses the dynamic `validate` middleware function
 * and applies specific rules for validating scanning-related inputs.
 * 
 * @see scanRules.imageUrl
 * @see scanRules.isbn
 * @see scanRules.check
 */
const validateScan = validate([scanRules.imageUrl, scanRules.isbn, scanRules.check]);

export { validateMember, validateScan };
