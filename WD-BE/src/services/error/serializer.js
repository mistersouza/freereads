import { ENV } from '../../config/env.js';

/**
* Streamlines error objects for consistency
*
* @param {Error} error - The error to serialize
* @param {boolean} includeStack - Whether to include stack trace
* @returns {Object} Serialized error object
*/
const serializeError = (error, logErrorStack = ENV.NODE_ENV === 'development') => {
  const metadata = {
    statusCode: error.statusCode || error.status || 500,
    code: error.code,
    name: error.name || 'Error',
    message: error.message || 'Unknown error',
    errorType: error.errorType || 'unknown'
  };

  if (error.context) metadata.context = error.context;
  if (error.summary) metadata.summary = error.summary;
  if (error.fields) metadata.fields = error.fields;
  if (logErrorStack) metadata.stack = error.stack;
  if (error.errors) metadata.validation = error.errors;

  return metadata;
};

export { serializeError };