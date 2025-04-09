import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createStream } from 'rotating-file-stream';

import { serializeError } from './serializer.js';

const createLog = (options = {}) => {
  const { isLive = process.env.NODE_ENV === 'production' } = options;

  const logsDir = path.join(process.cwd(), 'logs');

  // Create logs directory if it doesn't exist
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

  // Define formatLog function
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
  };

  const logFile = async (level, message, metadata) => {
    if (!isLive) return;

    const log = `${formatLog(level, message, metadata)}\n`;

    // Use object lookup instead of if/else
    const streamMap = {
      error: errorLogStream,
    };

    // Get appropriate stream or default to access log
    const stream = streamMap[level] || accessLogStream;
    stream.write(log);
  };

  /**
   * Logs HTTP request details to a file.
   * @param {Object} request - Express request object
   * @param {Object} response - Express response object
   */
  const httpRequest = () => (
    async (request, response, next) => {
      request.startTime = process.hrtime();

      response.on('finish', async () => {
        const {
          method, originalUrl: url, query, body,
        } = request;
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
          const sanitizedBody = { ...body };
          if (sanitizedBody.password) {
            sanitizedBody.password = '*******';
          }
          metadata.body = sanitizedBody;
        }

        // Use lookup object for status colors
        const statusColors = {
          5: chalk.red, // 500s
          4: chalk.yellow, // 400s
          3: chalk.cyan, // 300s
          2: chalk.green, // 200s
        };
        const statusColorKey = Math.floor(statusCode / 100);
        const statusColor = statusColors[statusColorKey] || chalk.white;

        if (!isLive) {
          // eslint-disable-next-line no-console
          console.log(
            `${chalk.bgWhite.black(` ${method.padEnd(6)}`)}`
            + ` ${url} `
            + `${statusColor(statusCode)} `
            + `${chalk.yellow(`${duration.toFixed(3)} ms`)} `
            + `- ${chalk.white(contentLength)}`,
          );

          if ('query' in metadata) {
            // eslint-disable-next-line no-console
            console.log(chalk.blue('Query:'), metadata.query);
          }

          if ('body' in metadata) {
            // eslint-disable-next-line no-console
            console.log(chalk.blue('Body:'), metadata.body);
          }
        }

        await logFile('info', `${method} ${url}`, metadata);
      });
      next();
    }
  );

  // Create a factory function for log methods
  const createLogMethod = (level) => async (message, metadata = {}) => {
    if (!isLive) {
      // eslint-disable-next-line no-console
      console[level](formatLog(level, message, metadata));
    }
    await logFile(level, message, metadata);
  };

  // Define logging methods using the factory
  const error = async (err) => {
    const metadata = serializeError(err);
    if (!isLive) {
      // eslint-disable-next-line no-console
      console.error(formatLog('error', metadata.message, metadata));
    }
    await logFile('error', metadata.message, metadata);
  };

  const warn = createLogMethod('warn');
  const info = createLogMethod('info');
  const debug = createLogMethod('debug');

  return {
    httpRequest, error, warn, info, debug,
  };
};

const log = createLog();

export { log };
