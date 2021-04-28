'use strict'

const { debug, error, info, warning } = require('@actions/core')

const log = (logger) => (message) => logger(JSON.stringify(message));

exports.logDebug = log(debug);
exports.logError = log(error);
exports.logInfo = log(info);
exports.logWarning = log(warning);
