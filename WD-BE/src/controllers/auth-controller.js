import mongoose from 'mongoose';

import ApiError from '../errors/api-error.js';
import User from '../models/User.js';
import { ENV } from '../config/env.js';

import { generateToken } from '../utils/jwt-handler.js';

const register = async (request, response, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, role } = request.body;

        const activeAccount = await User.findOne({ email });
        if (activeAccount) {
            throw new ApiError(
                'We’ve seen you before! Try logging in instead.',
                409
            );
        }

        const [ user ] = await User.create(
            [{ email, password, role }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        response.status(201).json({
            token: generateToken(user),
            user: { email, role }
        });
    } catch (error) {
        session.abortTransaction();
        next(error);
    }
};

const login = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            throw new ApiError(
                'No luck! That user\’s off the grid. Try registering instead.',
                404
            );
        }

        if (!await user.comparePassword(password)) {
            throw new ApiError(
                "Something’s off with that email or password. Give it another go!",
                401
            );
        }

        response.json({
            token: generateToken(user),
            user: { email, role: user.role }
        });
    } catch (error) {
        next(error);
        
    }
};

export { register, login };
