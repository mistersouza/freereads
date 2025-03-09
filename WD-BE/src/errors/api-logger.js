import chalk from 'chalk';

const createLog = () => {
    
    /**
     * Logs HTTP request details to a file.
     * @param {Object} request - Express request object
     * @param {Object} response - Express response object
     */
    const httpRequest = () => (
        (request, response, next) => {
            request.startTime = process.hrtime();

            response.on('finish', () => {
                const { method, originalUrl: url } = request;   
                const { statusCode } = response;
                 const hrTime = process.hrtime(request.startTime);
                const duration = hrTime[0] * 1000 + hrTime[1] / 1000000;
                const contentLength = response.get('Content-Length') || 'N/A';

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
            });
            next();
        }
    );

    /**
     * Logs warning information
     * @param {string} message - Warning message to log
     */
    const error = (error) => {
        console.error(chalk.red(`[ERROR] ${error.message}`));
        if (error.stack) {
            console.error(chalk.white(error.stack));
        }
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const warn = (message) => {
        console.warn(chalk.yellow(`[WARN] ${message}`));
    };

    /**
     * Logs info message
     * @param {string} message - Info message to log
     */
    const info = (message) => {
        console.info(chalk.green(`[INFO] ${message}`));
    };

    /**
     * Logs debug information
     * @param {string} message - Debug message to log
     */
    const debug = (message) => {
        console.debug(chalk.magenta(`[DEBUG] ${message}`));
    };

    return { httpRequest, error, warn, info, debug };
}

const log = createLog();

export default log;