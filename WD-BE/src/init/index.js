import { initializeServices } from './services.js';
import { log } from '../errors/index.js';

/**
 * Initializes core application services for request control and book finding.
 * 
 * @returns {Object} An object containing initialized services from request control and book finder
 */
const bootstrapServices = async () => {
    try {
        return await initializeServices();
    }
    catch (error) {
        log.error(error);
        process.exit(1); 
    }
};

export { bootstrapServices };
