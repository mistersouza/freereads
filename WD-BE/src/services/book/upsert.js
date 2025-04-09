import Book from '../../models/book-model.js';

/**
 * Either updates or creates a fresh record
 *
 * @param {Object} book - The book object to update or insert
 * @returns {Promise<Object>} The updated or newly created book record
 */
const updateOrInsert = async (book) => {
  const existingRecord = await Book.findOne({ isbn: book.isbn });
  if (existingRecord) {
    return Book.findByIdAndUpdate(
      existingRecord.id,
      book,
      {
        new: true,
        runValidators: true,
      },
    );
  }
  return Book.create(book);
};

export { updateOrInsert };
