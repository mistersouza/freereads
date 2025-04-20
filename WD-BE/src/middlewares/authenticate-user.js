import { JwtError } from '../services/error/classes/index.js';

/**
 * JWT-powered authentication
 *
 * @param {boolean} authenticate - Whether authentication is required
 */
const authenticateUser = (authenticate) => async (request, response, next) => {
  const token = request.app.locals.services.jwt
    .extractToken(request.headers.authorization);

  if (!token) {
    return authenticate
      ? next(JwtError.missing())
      : next();
  }

  try {
    const payload = request.app.locals.services.jwt
      .verifyToken(token, 'access');

    const isTokenBlacklisted = await request.app.locals.services.blacklist
      .isTokenBlacklisted(payload);

    if (isTokenBlacklisted) {
      return next(JwtError.blacklisted());
    }

    request.user = payload;
    return next();
  } catch (error) {
    return authenticate
      ? next(error)
      : next();
  }
};

const loadAuthenticatedUser = authenticateUser(true);
const loadAuthorizedUser = authenticateUser(false);

export { loadAuthenticatedUser, loadAuthorizedUser };
