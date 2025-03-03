import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

const generateToken = (payload) => {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
}

const verifyToken = (token) => {
    return jwt.verify(token, ENV.JWT_SECRET);
}

export { generateToken, verifyToken };
