/**
 * ===================================================================
 * ROUTES: DANH MỤC (Category Routes)
 * ===================================================================
 * Định nghĩa các routes cho Field, Genre, Author, Publisher
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { categoryController } = require('../controllers');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { staffOnly, adminOnly } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    createFieldValidator, updateFieldValidator,
    createGenreValidator, updateGenreValidator,
    createAuthorValidator, updateAuthorValidator,
    createPublisherValidator, updatePublisherValidator,
    idParamValidator
} = require('../validators');

// ===================================================================
// FIELD (Lĩnh vực) ROUTES
// ===================================================================

router.route('/fields')
    .get(categoryController.getFields)                                           // Public
    .post(authenticate, staffOnly, createFieldValidator, validate, categoryController.createField);

router.route('/fields/:id')
    .get(idParamValidator, validate, categoryController.getFieldById)           // Public
    .put(authenticate, staffOnly, updateFieldValidator, validate, categoryController.updateField)
    .delete(authenticate, adminOnly, idParamValidator, validate, categoryController.deleteField);

// ===================================================================
// GENRE (Thể loại) ROUTES
// ===================================================================

router.route('/genres')
    .get(categoryController.getGenres)                                           // Public
    .post(authenticate, staffOnly, createGenreValidator, validate, categoryController.createGenre);

router.route('/genres/:id')
    .get(idParamValidator, validate, categoryController.getGenreById)           // Public
    .put(authenticate, staffOnly, updateGenreValidator, validate, categoryController.updateGenre)
    .delete(authenticate, adminOnly, idParamValidator, validate, categoryController.deleteGenre);

// ===================================================================
// AUTHOR (Tác giả) ROUTES
// ===================================================================

router.route('/authors')
    .get(categoryController.getAuthors)                                          // Public
    .post(authenticate, staffOnly, createAuthorValidator, validate, categoryController.createAuthor);

router.route('/authors/:id')
    .get(idParamValidator, validate, categoryController.getAuthorById)          // Public
    .put(authenticate, staffOnly, updateAuthorValidator, validate, categoryController.updateAuthor)
    .delete(authenticate, adminOnly, idParamValidator, validate, categoryController.deleteAuthor);

// ===================================================================
// PUBLISHER (Nhà xuất bản) ROUTES
// ===================================================================

router.route('/publishers')
    .get(categoryController.getPublishers)                                       // Public
    .post(authenticate, staffOnly, createPublisherValidator, validate, categoryController.createPublisher);

router.route('/publishers/:id')
    .get(idParamValidator, validate, categoryController.getPublisherById)       // Public
    .put(authenticate, staffOnly, updatePublisherValidator, validate, categoryController.updatePublisher)
    .delete(authenticate, adminOnly, idParamValidator, validate, categoryController.deletePublisher);

module.exports = router;
