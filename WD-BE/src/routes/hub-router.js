import { Router } from 'express';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import { normalizeError, HUB_ERROR_MESSAGES } from '../errors/index.js';
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
router.use(normalizeError(HUB_ERROR_MESSAGES));

export default router;