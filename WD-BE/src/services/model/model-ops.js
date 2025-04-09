import { BusinessValidationError } from '../error/classes/index.js';

/**
 * Crafts a dynamic suite of database service methods.
 *
 * @param {Object} Model - Mongoose model
 * @param {String} resourceName - Name of the resource for error messages
 * @returns {Object} Object containing service methods
 */
const ops = (Model, resourceName) => ({
  create: async (data) => Model.create(data),
  findAll: async () => Model.find(),
  findById: async (id) => {
    const data = await Model.findById(id);
    if (!data) {
      throw BusinessValidationError.notFound(resourceName);
    }
    return data;
  },
  update: async (id, data) => {
    const updatedData = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw BusinessValidationError.notFound(resourceName);
    }
    return updatedData;
  },
  delete: async (id) => {
    const data = await Model.findByIdAndDelete(id);
    if (!data) {
      throw BusinessValidationError.notFound(resourceName);
    }
    return data;
  },
});

export { ops };
