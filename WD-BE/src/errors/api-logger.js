import chalk from 'chalk';
// Direct import to avoid circular dependency
import serializeError from './error-serializer.js';
import { ENV } from '../config/env.js';

const createLog = (options = {}) => {
    const { parseJson = ENV.NODE_ENV === 'production' } = options;

    const formatLog = (level, message, metadata = {}) => {
        if (parseJson) {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                message,
                ...metadata,
            });
        }
        
        const logColor = {
            error: chalk.red,
            warn: chalk.yellow,
            info: chalk.green,
            debug: chalk.magenta,
        };

        return `${logColor[level](`[${level.toUpperCase()}] ${message}`)}`;
    }
    
    /**
     * Logs HTTP request details to a file.
     * @param {Object} request - Express request object
     * @param {Object} response - Express response object
     */
    const httpRequest = () => (
        (request, response, next) => {
            request.startTime = process.hrtime();
            
            response.on('finish', () => {
                const { method, originalUrl: url, query, body } = request;
                const { statusCode } = response;
                const hrTime = process.hrtime(request.startTime);
                const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
                const contentLength = response.get('Content-Length') || 'N/A';

                const metadata = {
                    method,
                    url,
                    statusCode,
                    duration: duration.toFixed(3),
                    contentLength,
                };

                if (Object.keys(query ?? {}).length > 0) {
                    metadata.query = query;
                }
                if (method !== 'GET' && Object.keys(body ?? {}).length > 0) {
                    // Redact sensitive data
                    if (body.password) {
                        body.password = '*******';
                    }
                    metadata.body = body;
                }

                let statusColor = statusCode > 499 
                    ? chalk.red 
                    : statusCode > 399 
                        ? chalk.yellow
                        : statusCode > 299
                            ? chalk.cyan 
                            : statusCode > 199
                                ? chalk.green
                                : chalk.white;

                console.log(
                    `${chalk.bgWhite.black(` ${method.padEnd(6)}`)}` +
                    ` ${url} ` +
                    `${statusColor(statusCode)} ` +
                    `${chalk.yellow(duration.toFixed(3) + ' ms')} ` +
                    `- ${chalk.white(contentLength)}`
                );

                if ('query' in metadata) {
                    console.log(chalk.blue('Query:'), metadata.query);
                }

                if ('body' in metadata) {
                    console.log(chalk.blue('Body:'), metadata.body);
                }
            });
            next();
        }
    );

    /**
     * Logs warning information
     * @param {string} message - Warning message to log
     */
    const error = (error) => {
        const { message, metadata } = serializeError(error);
        console.error(formatLog('error', message, metadata));
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const warn = (message, metadata = {}) => {
        console.warn(formatLog('warn', message, metadata));
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const info = (message, metadata = {}) => {
        console.info(formatLog('info', message, metadata));
    };

    /**
     * Logs debug information
     * @param {string} message - Debug message to log
     */
    const debug = (message, metadata = {}) => {
        console.debug(formatLog('debug', message, metadata));
    };

    return { httpRequest, error, warn, info, debug };
}

const log = createLog();

export default log;