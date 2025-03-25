import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createStream } from 'rotating-file-stream';
// Direct import to avoid circular dependency
import serializeError from './error-serializer.js';
import { ENV } from '../config/env.js';

const createLog = (options = {}) => {
    const { isLive = ENV.NODE_ENV === 'production' } = options;

    const logsDir = path.join(process.cwd(), 'logs');
    const errorsPath = path.join(logsDir, 'errors.log');
    const accessPath = path.join(logsDir, 'access.log');
    
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const accessLogStream = createStream('access.log', {
        interval: '1d',
        path: logsDir,
        size: '10M',
    });

    const errorLogStream = createStream('errors.log', {
        interval: '1d',
        path: logsDir,
        size: '10M',
    });

    const logFile = async (level, message, metadata) => {
        if (!isLive) return;  

        const log = formatLog(level, message, metadata) + '\n';
        
        level === 'error' 
            ? errorLogStream.write(log)
            : accessLogStream.write(log);
    };

    const formatLog = (level, message, metadata = {}) => {
        if (isLive) {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                level,
                message,
                ...metadata,
            }, null, 2);
        }
        
        const logColor = {
            error: chalk.red,
            warn: chalk.yellow,
            info: chalk.green,
            debug: chalk.magenta,
        };

        let log = `${logColor[level](`[${level.toUpperCase()}] ${message}`)}`; 
        
        if (Object.keys(metadata).length > 0) {
            log += `\n${JSON.stringify(metadata, null, 2)}`;
        }

        return log;
    }
    
    /**
     * Logs HTTP request details to a file.
     * @param {Object} request - Express request object
     * @param {Object} response - Express response object
     */
    const httpRequest = () => (
        async (request, response, next) => {
            request.startTime = process.hrtime();
            
            response.on('finish', async () => {
                const { method, originalUrl: url, query, body } = request;
                const { statusCode } = response;
                const hrTime = process.hrtime(request.startTime);
                const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
                const contentLength = response.get('Content-Length') || 'N/A';

                const metadata = {};

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

                await logFile('info', `${method} ${url}`, metadata);
            });
            next();
        }
    );

    /**
     * Logs warning information
     * @param {string} message - Warning message to log
     */
    const error = async (error) => {
        const { message, metadata = {} } = serializeError(error);
        if (!isLive) console.error(formatLog('error', message, metadata));

        await logFile('error', message, metadata);
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const warn = async (message, metadata = {}) => {
        if (!isLive) console.warn(formatLog('warn', message, metadata));
        
        await logFile('warn', message, metadata);
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const info = async (message, metadata = {}) => {
        if (!isLive) console.info(formatLog('info', message, metadata));
        
        await logFile('info', message, metadata);
    };

    /**
     * Logs debug information
     * @param {string} message - Debug message to log
     */
    const debug = async (message, metadata = {}) => {
        if (!isLive) console.debug(formatLog('debug', message, metadata));

        await logFile('debug', message, metadata);
    };

    return { httpRequest, error, warn, info, debug };
}

const log = createLog();

export default log;