/**
 * @swagger
 * components:
 *   responses:
 *     BookNotFoundError:
 *       description: The requested book was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: fail
 *               message:
 *                 type: string
 *                 example: This book seems to have vanished from our shelves!
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               path:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/books:
 *   get:
 *     summary: Get all books
 *     description: Retrieve a list of all books in the system.
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     description: Retrieve details for a specific book by its ID.
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Hmm… this ID seems off. It doesn't match any records
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/BookNotFoundError'
 */

/**
 * @swagger
 * /api/v1/books:
 *   post:
 *     summary: Create a new book
 *     description: Add a new book to the system.
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - releaseYear
 *               - genre
 *               - isbn
 *               - copies
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               releaseYear:
 *                 type: number
 *               genre:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               copies:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *               hubs:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: "To Kill a Mockingbird"
 *               author: "Harper Lee"
 *               releaseYear: 1960
 *               genre: "Fiction"
 *               isbn: "9780061120084"
 *               description: "A novel about racial injustice and moral growth"
 *               copies: 5
 *               thumbnail: "https://example.com/mockingbird.jpg"
 *               hubs: ["60d0fe4f5311236168a109cb"]
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No title, no tale! Let's add one
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/books/{id}:
 *   patch:
 *     summary: Update a book
 *     description: Update an existing book's information.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               releaseYear:
 *                 type: number
 *               genre:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               copies:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *               hubs:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               copies: 10
 *               description: "Updated description with more details"
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/BookNotFoundError'
 */

/**
 * @swagger
 * /api/v1/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Remove a book from the system. Restricted to admin roles.
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book ID
 *     responses:
 *       204:
 *         description: Book successfully deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/BookNotFoundError'
 */

const getBooks = async (request, response, next) => {
  try {
    const books = await request.app.locals.services.book.findAll();
    response.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

const getBook = async (request, response, next) => {
  try {
    const book = await request.app.locals.services.book.findById(request.params.id);
    response.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

const updateOrInsertBook = async (request, response, next) => {
  try {
    const book = await request.app.locals.services.book.updateOrInsert(request.body);
    response.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (request, response, next) => {
  try {
    await request.app.locals.services.book.delete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
};

export {
  getBooks, getBook, updateOrInsertBook, deleteBook,
};
