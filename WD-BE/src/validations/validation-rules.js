import { body } from 'express-validator';

/**
 * Authentication field validation rules to keep things secure.
 * 
 * Defines express-validator rules for email and password validation.
 * @type {Object} userRules - Contains validation rules for email and password fields
 * @property {Function} email - Validates email format and presence
 * @property {Function} password - Validates password strength and complexity
 */
const userRules = {
  // Email validation
  email: body('email')
    .trim()
    .isString()
    .notEmpty()
    .withMessage('Drop your email to continue.')
    .bail()
    .isEmail()
    .withMessage('Oops! That email doesn\'t look right. Check it out.'),
  
  // Password validation
  password: body('password')
    .isString()
    .notEmpty()
    .withMessage('Type in a password to move forward.')
    .bail()
    .isLength({ min: 8 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/
    )
    .withMessage(
      'Security Check! Make it strong: 8+ chars, a mix of upper & lowercase, a number, and a special symbol'
    ),
};

/**
 * Book form input validation rules powered by express-validator.
 * 
 * Ensures that book entries have a title, author, and are assigned to at least one hub.
 * @constant
 * @type {Object}
 */
const bookRules = {
  title: body('title')
    .trim()
    .notEmpty()
    .withMessage("No title, no tale! Let's add one."),

  author: body('author')
    .trim()
    .notEmpty()
    .withMessage("No ghostwriters here! Drop the author's name."),

  hubs: body('hubs')
    .isArray({ min: 1 })
    .withMessage('Give this book a home!'),
};

/**
 * Validation rules for seamless book scanning and identification
 * 
 * Defines express-validator rules for image URL and ISBN validation.
 * @type {Object} scanRules - Contains validation rules for book scanning inputs
 * @property {Function} imageUrl - Validates optional image URL
 * @property {Function} isbn - Validates optional ISBN format
 * @property {Function} check - Custom validation to ensure either image URL or ISBN is provided
 */
const scanRules = {
  // Image URL validation
  imageUrl: body('imageUrl')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('No cover? Scan one in!')
    .isURL()
    .withMessage('Bad link? Drop an ISBN instead!'),

  // ISBN validation
  isbn: body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('If you’re adding an ISBN, make sure it’s legit!')
    .matches(/^(?:\d[- ]?){9}[\dXx]$|^(?:\d[- ]?){12}\d$/)
    .withMessage('ISBN not valid. Try another again!'),

  check: body().custom((value, { req: request }) => {
    const { imageUrl, isbn } = request.body;
    if (!imageUrl && !isbn) {
      throw new Error('No cover, no ISBN? Gotta give us something to work with!');
    }
    return true;
  })
};

export { userRules, bookRules, scanRules };
