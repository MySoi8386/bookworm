/**
 * ===================================================================
 * CONTROLLER: DANH MỤC (Category Controller)
 * ===================================================================
 * Xử lý CRUD cho các bảng danh mục:
 * - Field (Lĩnh vực)
 * - Genre (Thể loại)
 * - Author (Tác giả)
 * - Publisher (Nhà xuất bản)
 * ===================================================================
 */

const { Field, Genre, Author, Publisher, Book } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// ===================================================================
// FIELD (Lĩnh vực) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách lĩnh vực
 * @route   GET /api/fields
 * @access  Public
 */
const getFields = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    const where = {};
    if (keyword) {
        where[Op.or] = [
            { code: { [Op.like]: `%${keyword}%` } },
            { name: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const fields = await Field.findAll({
        where,
        order: [['name', 'ASC']]
    });

    res.json({
        success: true,
        data: fields
    });
});

/**
 * @desc    Lấy chi tiết lĩnh vực
 * @route   GET /api/fields/:id
 * @access  Public
 */
const getFieldById = asyncHandler(async (req, res) => {
    const field = await Field.findByPk(req.params.id, {
        include: [
            {
                model: Book,
                as: 'books',
                attributes: ['id', 'code', 'title']
            }
        ]
    });

    if (!field) {
        throw new AppError('Không tìm thấy lĩnh vực', 404);
    }

    res.json({
        success: true,
        data: field
    });
});

/**
 * @desc    Tạo lĩnh vực mới
 * @route   POST /api/fields
 * @access  Admin, Librarian
 */
const createField = asyncHandler(async (req, res) => {
    const { code, name, description } = req.body;

    // Kiểm tra code đã tồn tại
    const existing = await Field.findOne({ where: { code } });
    if (existing) {
        throw new AppError('Mã lĩnh vực đã tồn tại', 400);
    }

    const field = await Field.create({ code, name, description });

    res.status(201).json({
        success: true,
        message: 'Tạo lĩnh vực thành công',
        data: field
    });
});

/**
 * @desc    Cập nhật lĩnh vực
 * @route   PUT /api/fields/:id
 * @access  Admin, Librarian
 */
const updateField = asyncHandler(async (req, res) => {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
        throw new AppError('Không tìm thấy lĩnh vực', 404);
    }

    const { code, name, description } = req.body;

    // Kiểm tra code đã tồn tại (nếu thay đổi code)
    if (code && code !== field.code) {
        const existing = await Field.findOne({ where: { code } });
        if (existing) {
            throw new AppError('Mã lĩnh vực đã tồn tại', 400);
        }
    }

    await field.update({ code, name, description });

    res.json({
        success: true,
        message: 'Cập nhật lĩnh vực thành công',
        data: field
    });
});

/**
 * @desc    Xóa lĩnh vực
 * @route   DELETE /api/fields/:id
 * @access  Admin only
 */
const deleteField = asyncHandler(async (req, res) => {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
        throw new AppError('Không tìm thấy lĩnh vực', 404);
    }

    // Kiểm tra có sách nào thuộc lĩnh vực này không
    const booksCount = await Book.count({ where: { field_id: field.id } });
    if (booksCount > 0) {
        throw new AppError(`Không thể xóa. Có ${booksCount} sách thuộc lĩnh vực này`, 400);
    }

    await field.destroy();

    res.json({
        success: true,
        message: 'Xóa lĩnh vực thành công'
    });
});

// ===================================================================
// GENRE (Thể loại) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách thể loại
 * @route   GET /api/genres
 * @access  Public
 */
const getGenres = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    const where = {};
    if (keyword) {
        where[Op.or] = [
            { code: { [Op.like]: `%${keyword}%` } },
            { name: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const genres = await Genre.findAll({
        where,
        order: [['name', 'ASC']]
    });

    res.json({
        success: true,
        data: genres
    });
});

/**
 * @desc    Lấy chi tiết thể loại
 * @route   GET /api/genres/:id
 * @access  Public
 */
const getGenreById = asyncHandler(async (req, res) => {
    const genre = await Genre.findByPk(req.params.id, {
        include: [
            {
                model: Book,
                as: 'books',
                attributes: ['id', 'code', 'title']
            }
        ]
    });

    if (!genre) {
        throw new AppError('Không tìm thấy thể loại', 404);
    }

    res.json({
        success: true,
        data: genre
    });
});

/**
 * @desc    Tạo thể loại mới
 * @route   POST /api/genres
 * @access  Admin, Librarian
 */
const createGenre = asyncHandler(async (req, res) => {
    const { code, name, description } = req.body;

    const existing = await Genre.findOne({ where: { code } });
    if (existing) {
        throw new AppError('Mã thể loại đã tồn tại', 400);
    }

    const genre = await Genre.create({ code, name, description });

    res.status(201).json({
        success: true,
        message: 'Tạo thể loại thành công',
        data: genre
    });
});

/**
 * @desc    Cập nhật thể loại
 * @route   PUT /api/genres/:id
 * @access  Admin, Librarian
 */
const updateGenre = asyncHandler(async (req, res) => {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
        throw new AppError('Không tìm thấy thể loại', 404);
    }

    const { code, name, description } = req.body;

    if (code && code !== genre.code) {
        const existing = await Genre.findOne({ where: { code } });
        if (existing) {
            throw new AppError('Mã thể loại đã tồn tại', 400);
        }
    }

    await genre.update({ code, name, description });

    res.json({
        success: true,
        message: 'Cập nhật thể loại thành công',
        data: genre
    });
});

/**
 * @desc    Xóa thể loại
 * @route   DELETE /api/genres/:id
 * @access  Admin only
 */
const deleteGenre = asyncHandler(async (req, res) => {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
        throw new AppError('Không tìm thấy thể loại', 404);
    }

    const booksCount = await Book.count({ where: { genre_id: genre.id } });
    if (booksCount > 0) {
        throw new AppError(`Không thể xóa. Có ${booksCount} sách thuộc thể loại này`, 400);
    }

    await genre.destroy();

    res.json({
        success: true,
        message: 'Xóa thể loại thành công'
    });
});

// ===================================================================
// AUTHOR (Tác giả) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách tác giả
 * @route   GET /api/authors
 * @access  Public
 */
const getAuthors = asyncHandler(async (req, res) => {
    const { keyword, page = 1, limit = 20 } = req.query;

    const where = {};
    if (keyword) {
        where[Op.or] = [
            { name: { [Op.like]: `%${keyword}%` } },
            { workplace: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Author.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        offset
    });

    res.json({
        success: true,
        data: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    });
});

/**
 * @desc    Lấy chi tiết tác giả
 * @route   GET /api/authors/:id
 * @access  Public
 */
const getAuthorById = asyncHandler(async (req, res) => {
    const author = await Author.findByPk(req.params.id, {
        include: [
            {
                model: Book,
                as: 'books',
                attributes: ['id', 'code', 'title'],
                through: { attributes: [] }
            }
        ]
    });

    if (!author) {
        throw new AppError('Không tìm thấy tác giả', 404);
    }

    res.json({
        success: true,
        data: author
    });
});

/**
 * @desc    Tạo tác giả mới
 * @route   POST /api/authors
 * @access  Admin, Librarian
 */
const createAuthor = asyncHandler(async (req, res) => {
    const { name, title, workplace, bio } = req.body;

    const author = await Author.create({ name, title, workplace, bio });

    res.status(201).json({
        success: true,
        message: 'Tạo tác giả thành công',
        data: author
    });
});

/**
 * @desc    Cập nhật tác giả
 * @route   PUT /api/authors/:id
 * @access  Admin, Librarian
 */
const updateAuthor = asyncHandler(async (req, res) => {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
        throw new AppError('Không tìm thấy tác giả', 404);
    }

    const { name, title, workplace, bio } = req.body;
    await author.update({ name, title, workplace, bio });

    res.json({
        success: true,
        message: 'Cập nhật tác giả thành công',
        data: author
    });
});

/**
 * @desc    Xóa tác giả
 * @route   DELETE /api/authors/:id
 * @access  Admin only
 */
const deleteAuthor = asyncHandler(async (req, res) => {
    const author = await Author.findByPk(req.params.id, {
        include: [{ model: Book, as: 'books' }]
    });

    if (!author) {
        throw new AppError('Không tìm thấy tác giả', 404);
    }

    if (author.books && author.books.length > 0) {
        throw new AppError(`Không thể xóa. Tác giả có ${author.books.length} sách`, 400);
    }

    await author.destroy();

    res.json({
        success: true,
        message: 'Xóa tác giả thành công'
    });
});

// ===================================================================
// PUBLISHER (Nhà xuất bản) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách nhà xuất bản
 * @route   GET /api/publishers
 * @access  Public
 */
const getPublishers = asyncHandler(async (req, res) => {
    const { keyword } = req.query;

    const where = {};
    if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
    }

    const publishers = await Publisher.findAll({
        where,
        order: [['name', 'ASC']]
    });

    res.json({
        success: true,
        data: publishers
    });
});

/**
 * @desc    Lấy chi tiết nhà xuất bản
 * @route   GET /api/publishers/:id
 * @access  Public
 */
const getPublisherById = asyncHandler(async (req, res) => {
    const publisher = await Publisher.findByPk(req.params.id);

    if (!publisher) {
        throw new AppError('Không tìm thấy nhà xuất bản', 404);
    }

    res.json({
        success: true,
        data: publisher
    });
});

/**
 * @desc    Tạo nhà xuất bản mới
 * @route   POST /api/publishers
 * @access  Admin, Librarian
 */
const createPublisher = asyncHandler(async (req, res) => {
    const { name, address, established_date, phone, email } = req.body;

    const publisher = await Publisher.create({
        name, address, established_date, phone, email
    });

    res.status(201).json({
        success: true,
        message: 'Tạo nhà xuất bản thành công',
        data: publisher
    });
});

/**
 * @desc    Cập nhật nhà xuất bản
 * @route   PUT /api/publishers/:id
 * @access  Admin, Librarian
 */
const updatePublisher = asyncHandler(async (req, res) => {
    const publisher = await Publisher.findByPk(req.params.id);

    if (!publisher) {
        throw new AppError('Không tìm thấy nhà xuất bản', 404);
    }

    const { name, address, established_date, phone, email } = req.body;
    await publisher.update({ name, address, established_date, phone, email });

    res.json({
        success: true,
        message: 'Cập nhật nhà xuất bản thành công',
        data: publisher
    });
});

/**
 * @desc    Xóa nhà xuất bản
 * @route   DELETE /api/publishers/:id
 * @access  Admin only
 */
const deletePublisher = asyncHandler(async (req, res) => {
    const { BookEdition } = require('../models');

    const publisher = await Publisher.findByPk(req.params.id);

    if (!publisher) {
        throw new AppError('Không tìm thấy nhà xuất bản', 404);
    }

    const editionsCount = await BookEdition.count({ where: { publisher_id: publisher.id } });
    if (editionsCount > 0) {
        throw new AppError(`Không thể xóa. NXB có ${editionsCount} phiên bản sách`, 400);
    }

    await publisher.destroy();

    res.json({
        success: true,
        message: 'Xóa nhà xuất bản thành công'
    });
});

module.exports = {
    // Field
    getFields,
    getFieldById,
    createField,
    updateField,
    deleteField,

    // Genre
    getGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre,

    // Author
    getAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,

    // Publisher
    getPublishers,
    getPublisherById,
    createPublisher,
    updatePublisher,
    deletePublisher
};
