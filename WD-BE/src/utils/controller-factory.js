import ApiError from '../errors/api-error.js';

/**
 * Creates a set of CRUD controller handlers for a given model
 * @param {Object} Model - Mongoose model
 * @param {String} notFoundMessage - Specific not found message for this resource
 * @returns {Object} Object containing controller handlers
 */
const controllerFactory = (Model, notFoundMessage) => {
  return {
    /**
     * Gets all resources
     */
    getAll: async (request, response, next) => {
      try {
        const data = await Model.find();
        response.status(200).json(data);
      } catch (error) {
        next(error);
      }
    },

    /**
     * Gets a single resource by ID
     */
    getOne: async (request, response, next) => {
      try {
        const { id } = request.params;
        const data = await Model.findById(id);
        
        if (!data) {
          throw new ApiError(notFoundMessage, 404);
        }
        
        response.status(200).json(data);
      } catch (error) {
        next(error);
      }
    },

    /**
     * Creates a new resource
     */
    createOne: async (request, response, next) => {
      try {
        const data = await Model.create(request.body);
        response.status(201).json(data);
      } catch (error) {
        next(error);
      }
    },

    /**
     * Updates a resource by ID
     */
    updateOne: async (request, response, next) => {
      try {
        const { id } = request.params;
        const data = await Model.findByIdAndUpdate(id, request.body, {
          new: true,
          runValidators: true,
        });
        
        if (!data) {
          throw new ApiError(notFoundMessage, 404);
        }
        
        response.status(200).json(data);
      } catch (error) {
        next(error);
      }
    },

    /**
     * Deletes a resource by ID
     */
    deleteOne: async (request, response, next) => {
      try {
        const { id } = request.params;
        const data = await Model.findByIdAndDelete(id);
        
        if (!data) {
          throw new ApiError(notFoundMessage, 404);
        }
        
        response.status(204).json();
      } catch (error) {
        next(error);
      }
    }
  };
};

export default controllerFactory;
