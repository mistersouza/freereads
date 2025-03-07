import { Hub } from '../models/hub-model.js';
import controllerFactory from '../utils/controller-factory.js';

const { 
    getAll: getAllHubs,
    getOne: getOneHub,
    create: createHub,
    update: updateHub,
    deleteOne: deleteHub 
} = controllerFactory(Hub, 'hubs');

export { getAllHubs, getOneHub, createHub, updateHub, deleteHub };
