/**
 * Service-level messages
 * @type {Object.<string, string|function>}
 */
const BLACKLIST_SERVICE_MESSAGES = {
  BLACKLIST_FAILED: (entity) => `${entity} said nope to the blacklist.`,
  REFRESH_ROTATION: 'Refresh token rotation!',
  TOO_MANY_ATTEMPTS: (type) => `Too many ${type} attempts.`,
};

export { BLACKLIST_SERVICE_MESSAGES };
