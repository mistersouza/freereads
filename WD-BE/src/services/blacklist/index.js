import { isBlacklisted, blacklistIP, _recordAttempt } from "./helpers.js";
import { log } from "../../errors/index.js";
import { ENV } from "../../config/env.js";

const initializeBlacklist = async () => {
  return {
    blacklistIP,
    isBlacklisted,
    recordFailedApi: async (ip) => _recordAttempt(ip, "api", ENV.MAX_API_ABUSE)
        .catch((error) => log.error(error)),
    recordFailedLogin: async (ip) => _recordAttempt(ip, "login", ENV.MAX_LOGIN_ATTEMPTS)
        .catch((error) => log.error(error)),
  };
};

export { initializeBlacklist };