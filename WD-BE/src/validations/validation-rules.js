import { body } from 'express-validator';


/**
 * Authentication field validation rules to keep things secure.
 */
const userRules = {
  email: body('email')
    .exists().withMessage('[REQUIRED] Drop your email to continue.')
    .bail()
    .notEmpty().withMessage('[REQUIRED] Drop your email to continue.')
    .bail()
    .isEmail().withMessage('Oops! That email doesn\'t look right. Check it out.'),
    
  password: body('password')
    .exists().withMessage('[REQUIRED] Type in a password to move forward.')
    .bail()
    .notEmpty().withMessage('[REQUIRED] Type in a password to move forward.')
    .bail()
    .isLength({ min: 8 }).withMessage('Security Check! Make it strong: 8+ chars, a mix of upper & lowercase, a number, and a special symbol')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/)
    .withMessage('Security Check! Make it strong: 8+ chars, a mix of upper & lowercase, a number, and a special symbol'),
    
  role: body('role')
    .optional()
    .isIn(['member', 'boss', 'overlord'])
    .withMessage('Pick wisely: Role must be \'member\', \'boss\', or \'overlord\'.'),
};

/**
 * Rock-solid Hub form validation
 * 
 * Ensures that hub entries have a street and postcode.
 * @constant
 * @type {Object}
 */
const hubRules = {
  street: body('street')
    .trim()
    .notEmpty()
    .withMessage("Don't leave me lost — add a street!"),
  postcode: body('postcode')
    .trim()
    .notEmpty()
    .withMessage('Zip it up! We need that postcode.'),
};

/**
 * Sharp-eyed validation for flawless book entries
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
  isbn: body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('If you’re adding an ISBN, make sure it’s legit!')
    .matches(/^(?:\d[- ]?){9}[\dXx]$|^(?:\d[- ]?){12}\d$/)
    .withMessage('ISBN not valid. Try another again!'),
  hubs: body('hubs')
    .isArray({ min: 1 })
    .withMessage('Give this book a home!'),
};

/**
 * Seamless book recognition—powered by sharp validation
 * 
 * Defines express-validator rules for image URL and ISBN validation.
 * @type {Object} scanRules - Contains validation rules for book scanning inputs
 * @property {Function} imageUrl - Validates optional image URL
 * @property {Function} isbn - Validates optional ISBN format
 * @property {Function} check - Custom validation to ensure either image URL or ISBN is provided
 */
const scanRules = {
  imageUrl: body('imageUrl')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('No cover? Scan one in!')
    .isURL()
    .withMessage('Bad link? Drop an ISBN instead!'),

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

const tokenRules = {
  refresh: body('refreshToken')
    .exists().withMessage('Missing refresh token.')
    .bail()
    .isString().withMessage('Token gotta be a string.')
    .bail()
    .isLength({ min: 1 }).withMessage('Token cannot be empty.')
};

export { bookRules, hubRules, scanRules, userRules, tokenRules };
