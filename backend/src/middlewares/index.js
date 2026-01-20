/**
 * ===================================================================
 * MIDDLEWARES INDEX
 * ===================================================================
 * Export tất cả middlewares
 * ===================================================================
 */

const { authenticate, optionalAuth } = require('./auth');
const { authorize, adminOnly, staffOnly, authenticated, ownerOrAdmin } = require('./authorize');
const errorHandler = require('./errorHandler');
const { asyncHandler, AppError } = require('./errorHandler');
const validate = require('./validate');

module.exports = {
    // Authentication
    authenticate,
    optionalAuth,

    // Authorization
    authorize,
    adminOnly,
    staffOnly,
    authenticated,
    ownerOrAdmin,

    // Error handling
    errorHandler,
    asyncHandler,
    AppError,

    // Validation
    validate
};
