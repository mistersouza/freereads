import { ApiError } from '../../errors/index.js';

/**
 * Crafts a dynamic suite of database service methods.
 * 
 * @param {Object} Model - Mongoose model
 * @param {String} resourceName - Name of the resource for error messages
 * @returns {Object} Object containing service methods
 */
const ops = (Model, resourceName) => ({
    create: async (data) => {
        return await Model.create(data);
    },
    findAll: async () => {
        return await Model.find();
    },
    findById: async (id) => {
        const data = await Model.findById(id);
        if (!data) {
            throw new ApiError(404, resourceName);
        }
        return data;
    },
    update: async (id, data) => {
        const updatedData = await Model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        if (!updatedData) {
            throw new ApiError(404, resourceName);
        }
        return updatedData;
    },
    delete: async (id) => {
        const data = await Model.findByIdAndDelete(id);
        if (!data) {
            throw new ApiError(404, resourceName);
        }
        return data;
    }
});

export { ops };
