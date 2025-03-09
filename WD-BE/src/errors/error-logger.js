import chalk from 'chalk';

const createLogger = () => {
    
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
    return { httpRequest };
}

const log = createLogger();

export default log;