import Hub from '../models/hub-model.js';
import controllerFactory from '../utils/controller-factory.js';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     HubNotFoundError:
 *       description: The requested hub was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: fail
 *               message:
 *                 type: string
 *                 example: The pickup point you're looking for is MIA!
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               path:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/hubs:
 *   get:
 *     summary: Get all hubs
 *     description: Retrieve a list of all book pickup hubs
 *     tags: [Hubs]
 *     responses:
 *       200:
 *         description: A list of hubs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hub'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *   post:
 *     summary: Create a new hub
 *     description: Add a new book pickup location. Restricted to overlord role.
 *     tags: [Hubs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - postcode
 *             properties:
 *               street:
 *                 type: string
 *                 description: Street address of the hub
 *                 example: "123 Library Lane"
 *               postcode:
 *                 type: string
 *                 description: Postal code of the hub
 *                 example: "XY12 3ZA"
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of book IDs
 *                 example: ["60d21b4667d0d8992e610c86"]
 *     responses:
 *       201:
 *         description: Hub created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hub'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: "Don't leave me lost — add a street!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/hubs/{id}:
 *   get:
 *     summary: Get a hub by ID
 *     description: Retrieve a single hub by its ID
 *     tags: [Hubs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hub ID
 *     responses:
 *       200:
 *         description: Hub data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hub'
 *       404:
 *         $ref: '#/components/responses/HubNotFoundError'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Hmm… this ID seems off. It doesn't match any records
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *   put:
 *     summary: Update a hub
 *     description: Update a hub's information. Restricted to overlord and boss roles.
 *     tags: [Hubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hub ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 description: Street address of the hub
 *               postcode:
 *                 type: string
 *                 description: Postal code of the hub
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of book IDs
 *     responses:
 *       200:
 *         description: Hub updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hub'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/HubNotFoundError'
 *   delete:
 *     summary: Delete a hub
 *     description: Remove a hub from the system. Restricted to overlord role.
 *     tags: [Hubs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The hub ID
 *     responses:
 *       204:
 *         description: Hub successfully deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/HubNotFoundError'
 */

const { 
    getAll: getAllHubs,
    getOne: getOneHub,
    create: createHub,
    update: updateHub,
    deleteOne: deleteHub 
} = controllerFactory(Hub, 'hubs');

export { getAllHubs, getOneHub, createHub, updateHub, deleteHub };