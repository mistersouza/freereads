/**
* Streamlines error objects for consistency
*
* @param {Error} error - The error to serialize
* @param {boolean} includeStack - Whether to include stack trace
* @returns {Object} Serialized error object
*/
const serializeError = (error) => {
  const logErrorStack = process.env.NODE_ENV === 'development';

  return {
    statusCode: error.statusCode || error.status || 500,
    name: error.name || 'Error',
    errorType: error.errorType || 'unknown',
    message: error.message || 'Something went wrong.',
    context: error.context ?? undefined,
    summary: error.summary ?? undefined,
    fields: error.fields ?? undefined,
    validation: error.errors ?? undefined,
    ...(logErrorStack && { stack: error.stack }),
  };
};

export { serializeError };
