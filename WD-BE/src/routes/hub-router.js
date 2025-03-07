import { Router } from 'express';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { HUB_ERROR_MESSAGES } from '../errors/index.js';

import { 
    getAllHubs,
    getOneHub,
    createHub,
    updateHub,
    deleteHub 
} from '../controllers/hub-controller.js';


const router = Router();

router.route('/')
    .get(getAllHubs)
    .post(authorizeAccess(['overlord']), createHub);

router.route('/:id')
    .get(getOneHub)
    .put(authorizeAccess(['overlord', 'boss']), updateHub)
    .delete(authorizeAccess(['overlord']), deleteHub);

router.use(normalizeError(HUB_ERROR_MESSAGES));

export default router;
