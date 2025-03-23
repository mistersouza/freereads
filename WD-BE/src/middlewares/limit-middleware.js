/**
 * Smart middleware to manage request rate and speed limits.
 * 
 * @returns {Function} Express middleware function that applies speed and rate limiting
 */const limitTraffic = [
    (request, response, next) => request.app.locals.services
        .loadAuthorizedUser(request, response, next),
    (request, response, next) => request.app.locals.services
        .speedLimiter(request, response, next),
    (request, response, next) => request.app.locals.services
        .rateLimiter(request, response, next),
];

export { limitTraffic };
