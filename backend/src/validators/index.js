/**
 * ===================================================================
 * VALIDATORS INDEX
 * ===================================================================
 * Export tất cả validators
 * ===================================================================
 */

const authValidator = require('./auth.validator');
const categoryValidator = require('./category.validator');
const bookValidator = require('./book.validator');
const readerValidator = require('./reader.validator');
const borrowValidator = require('./borrow.validator');

module.exports = {
    ...authValidator,
    ...categoryValidator,
    ...bookValidator,
    ...readerValidator,
    ...borrowValidator
};
