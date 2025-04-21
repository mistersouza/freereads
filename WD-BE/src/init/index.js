import { initializeServices } from './services.js';
import { log } from '../services/error/index.js';

/**
 * Initializes core application services for request control and book finding.
 *
 * @returns {Object} An object containing initialized services from request control and book finder
 */

// eslint-disable-next-line consistent-return
const bootstrapServices = async () => {
  try {
    const services = await initializeServices();
    log.info('Services are up and running.');
    return services;
  } catch (error) {
    log.warn('Something went wrong while spinning up services.');
    log.error(error);
    process.exit(1);
  }
};

export { bootstrapServices };
