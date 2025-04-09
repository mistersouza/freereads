import Hub from '../../models/hub-model.js';
import { initializeModelOps } from '../model/index.js';

/**
 * Boots up the hub service
 *
 * @returns {Object} Book service functions
 */
const initializeHubService = () => {
  const ops = initializeModelOps(Hub, 'hubs');
  return {
    ...ops,
  };
};

export { initializeHubService };
