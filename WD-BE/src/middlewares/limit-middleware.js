/**
 * Smart middleware to manage request rate and speed limits.
 * 
 * @returns {Function} Express middleware function that applies speed and rate limiting
 */const limitTraffic = [
    (request, response, next) => request.app.locals.services.user
        .loadAuthorizedUser(request, response, next),
    (request, response, next) => request.app.locals.services.requestControl
        .speedLimiter(request, response, next),
    (request, response, next) => request.app.locals.services.requestControl
        .rateLimiter(request, response, next),
];

export { limitTraffic };
