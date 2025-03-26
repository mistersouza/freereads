import Book from "../../models/book-model.js";

/**
 * Either updates or creates a fresh record
 * 
 * @param {Object} book - The book object to update or insert
 * @returns {Promise<Object>} The updated or newly created book record
 */
const updateOrInsert = async (book) => {
    const existingRecord = await Book.findOne({ isbn: book.isbn });
    if (existingRecord) {
        return await Book.findByIdAndUpdate(
            existingRecord._id, 
            book, 
            { 
                new: true,
                runValidators: true,
             });
    }
    return await Book.create(book); 
};

export { updateOrInsert };
