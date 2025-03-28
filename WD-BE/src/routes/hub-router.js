import { Router } from 'express';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import { HUB_ERROR_MESSAGES } from '../services/error/constants.js';
import { handleError } from '../services/error/handler.js';
import { 
    getHubs,
    getHub,
    createHub,
    updateHub,
    deleteHub 
} from '../controllers/hub-controller.js';

/**
 * @swagger
 * tags:
 *   name: Hubs
 *   description: Hubs management API (v1)
 */
const router = Router();

// Open to All (Public Routes)
router.get('/', getHubs);
router.get('/:id', getHub);

// Elite Access Only (Restricted Routes)
router.post('/', authorizeAccess(['overlord', 'boss']), createHub);
router.put('/:id', authorizeAccess(['overlord', 'boss']), updateHub);
router.delete('/:id', authorizeAccess(['overlord']), deleteHub);

// Error handling middleware
router.use(handleError(HUB_ERROR_MESSAGES));

export default router;