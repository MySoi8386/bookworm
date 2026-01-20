/**
 * ===================================================================
 * CONTROLLER: SÁCH (Book Controller)
 * ===================================================================
 * Xử lý CRUD cho sách:
 * - Book (Đầu sách)
 * - BookEdition (Phiên bản xuất bản)
 * - BookCopy (Bản sách vật lý)
 * ===================================================================
 */

const {
    Book, BookAuthor, BookEdition, BookCopy,
    Field, Genre, Author, Publisher,
    BorrowDetail, BorrowRequest, LibraryCard, Reader,
    sequelize
} = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

// ===================================================================
// BOOK (Đầu sách) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách sách (có tìm kiếm, lọc, phân trang)
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = asyncHandler(async (req, res) => {
    const {
        keyword, field_id, genre_id, author_id, publisher_id, publish_year,
        page = 1, limit = 10
    } = req.query;

    // Xây dựng điều kiện where
    const where = {};

    if (keyword) {
        where[Op.or] = [
            { code: { [Op.like]: `%${keyword}%` } },
            { title: { [Op.like]: `%${keyword}%` } }
        ];
    }

    if (field_id) where.field_id = field_id;
    if (genre_id) where.genre_id = genre_id;

    // Điều kiện include cho author và publisher
    const includeAuthor = {
        model: Author,
        as: 'authors',
        attributes: ['id', 'name', 'title'],
        through: { attributes: [] }
    };
    if (author_id) {
        includeAuthor.where = { id: author_id };
    }

    const includeEdition = {
        model: BookEdition,
        as: 'editions',
        attributes: ['id', 'publish_year', 'isbn'],
        include: [
            {
                model: Publisher,
                as: 'publisher',
                attributes: ['id', 'name']
            }
        ]
    };
    if (publisher_id || publish_year) {
        includeEdition.where = {};
        if (publisher_id) includeEdition.where.publisher_id = publisher_id;
        if (publish_year) includeEdition.where.publish_year = publish_year;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Book.findAndCountAll({
        where,
        include: [
            {
                model: Field,
                as: 'field',
                attributes: ['id', 'code', 'name']
            },
            {
                model: Genre,
                as: 'genre',
                attributes: ['id', 'code', 'name']
            },
            includeAuthor,
            includeEdition
        ],
        order: [['title', 'ASC']],
        limit: parseInt(limit),
        offset,
        distinct: true // Để count đúng khi có many-to-many
    });

    // Tính số lượng bản sách cho mỗi sách
    const booksWithCounts = await Promise.all(rows.map(async (book) => {
        const bookJson = book.toJSON();

        // Đếm tổng số bản sách và số bản có sẵn
        const totalCopies = await BookCopy.count({
            include: [{
                model: BookEdition,
                as: 'bookEdition',
                where: { book_id: book.id },
                attributes: []
            }]
        });

        const availableCopies = await BookCopy.count({
            include: [{
                model: BookEdition,
                as: 'bookEdition',
                where: { book_id: book.id },
                attributes: []
            }],
            where: { status: 'available' }
        });

        return {
            ...bookJson,
            total_copies: totalCopies,
            available_copies: availableCopies
        };
    }));

    res.json({
        success: true,
        data: booksWithCounts,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    });
});

/**
 * @desc    Lấy chi tiết sách (bao gồm editions, copies, authors, borrower info)
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id, {
        include: [
            {
                model: Field,
                as: 'field',
                attributes: ['id', 'code', 'name']
            },
            {
                model: Genre,
                as: 'genre',
                attributes: ['id', 'code', 'name']
            },
            {
                model: Author,
                as: 'authors',
                attributes: ['id', 'name', 'title', 'workplace'],
                through: { attributes: [] }
            },
            {
                model: BookEdition,
                as: 'editions',
                include: [
                    {
                        model: Publisher,
                        as: 'publisher',
                        attributes: ['id', 'name']
                    },
                    {
                        model: BookCopy,
                        as: 'copies',
                        attributes: ['id', 'copy_number', 'price', 'status', 'condition_notes']
                    }
                ]
            }
        ]
    });

    if (!book) {
        throw new AppError('Không tìm thấy sách', 404);
    }

    // Tính số lượng bản sách
    const totalCopies = await BookCopy.count({
        include: [{
            model: BookEdition,
            as: 'bookEdition',
            where: { book_id: book.id },
            attributes: []
        }]
    });

    const availableCopies = await BookCopy.count({
        include: [{
            model: BookEdition,
            as: 'bookEdition',
            where: { book_id: book.id },
            attributes: []
        }],
        where: { status: 'available' }
    });

    // Lấy thông tin người đang mượn cho các bản sách "borrowed"
    const bookData = book.toJSON();

    // Collect all borrowed copy ids
    const borrowedCopyIds = [];
    bookData.editions?.forEach(edition => {
        edition.copies?.forEach(copy => {
            if (copy.status === 'borrowed') {
                borrowedCopyIds.push(copy.id);
            }
        });
    });

    // Fetch borrower info for borrowed copies
    const borrowerMap = {};
    if (borrowedCopyIds.length > 0) {
        const borrowDetails = await BorrowDetail.findAll({
            where: {
                book_copy_id: { [Op.in]: borrowedCopyIds },
                actual_return_date: null // Chưa trả
            },
            include: [{
                model: BorrowRequest,
                as: 'borrowRequest',
                where: { status: { [Op.in]: ['borrowed', 'overdue'] } },
                attributes: ['id', 'borrow_date', 'due_date', 'status'],
                include: [{
                    model: LibraryCard,
                    as: 'libraryCard',
                    attributes: ['id'],
                    include: [{
                        model: Reader,
                        as: 'reader',
                        attributes: ['id', 'full_name', 'phone']
                    }]
                }]
            }]
        });

        borrowDetails.forEach(detail => {
            const reader = detail.borrowRequest?.libraryCard?.reader;
            if (reader) {
                borrowerMap[detail.book_copy_id] = {
                    id: reader.id,
                    name: reader.full_name,
                    phone: reader.phone,
                    borrow_date: detail.borrowRequest.borrow_date,
                    due_date: detail.borrowRequest.due_date,
                    request_status: detail.borrowRequest.status
                };
            }
        });
    }

    // Gắn thông tin borrower vào copies
    bookData.editions = bookData.editions?.map(edition => ({
        ...edition,
        copies: edition.copies?.map(copy => ({
            ...copy,
            borrower: borrowerMap[copy.id] || null
        }))
    }));

    res.json({
        success: true,
        data: {
            ...bookData,
            total_copies: totalCopies,
            available_copies: availableCopies
        }
    });
});

/**
 * @desc    Tạo đầu sách mới
 * @route   POST /api/books
 * @access  Admin, Librarian
 */
const createBook = asyncHandler(async (req, res) => {
    const {
        code, title, field_id, genre_id,
        page_count, size, description, author_ids
    } = req.body;

    // Kiểm tra mã sách đã tồn tại
    const existing = await Book.findOne({ where: { code } });
    if (existing) {
        throw new AppError('Mã sách đã tồn tại', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Tạo sách
        const book = await Book.create({
            code, title, field_id, genre_id, page_count, size, description
        }, { transaction });

        // Thêm tác giả (nếu có)
        if (author_ids && author_ids.length > 0) {
            const bookAuthors = author_ids.map(author_id => ({
                book_id: book.id,
                author_id
            }));
            await BookAuthor.bulkCreate(bookAuthors, { transaction });
        }

        await transaction.commit();

        // Lấy lại sách với đầy đủ thông tin
        const createdBook = await Book.findByPk(book.id, {
            include: [
                { model: Field, as: 'field' },
                { model: Genre, as: 'genre' },
                { model: Author, as: 'authors', through: { attributes: [] } }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Tạo đầu sách thành công',
            data: createdBook
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Cập nhật đầu sách
 * @route   PUT /api/books/:id
 * @access  Admin, Librarian
 */
const updateBook = asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        throw new AppError('Không tìm thấy sách', 404);
    }

    const {
        code, title, field_id, genre_id,
        page_count, size, description, author_ids
    } = req.body;

    // Kiểm tra mã sách đã tồn tại (nếu thay đổi)
    if (code && code !== book.code) {
        const existing = await Book.findOne({ where: { code } });
        if (existing) {
            throw new AppError('Mã sách đã tồn tại', 400);
        }
    }

    const transaction = await sequelize.transaction();

    try {
        // Cập nhật sách
        await book.update({
            code, title, field_id, genre_id, page_count, size, description
        }, { transaction });

        // Cập nhật tác giả (nếu có)
        if (author_ids !== undefined) {
            // Xóa tất cả tác giả cũ
            await BookAuthor.destroy({ where: { book_id: book.id }, transaction });

            // Thêm tác giả mới
            if (author_ids.length > 0) {
                const bookAuthors = author_ids.map(author_id => ({
                    book_id: book.id,
                    author_id
                }));
                await BookAuthor.bulkCreate(bookAuthors, { transaction });
            }
        }

        await transaction.commit();

        // Lấy lại sách với đầy đủ thông tin
        const updatedBook = await Book.findByPk(book.id, {
            include: [
                { model: Field, as: 'field' },
                { model: Genre, as: 'genre' },
                { model: Author, as: 'authors', through: { attributes: [] } }
            ]
        });

        res.json({
            success: true,
            message: 'Cập nhật sách thành công',
            data: updatedBook
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Xóa đầu sách
 * @route   DELETE /api/books/:id
 * @access  Admin only
 */
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        throw new AppError('Không tìm thấy sách', 404);
    }

    // Kiểm tra có bản sách nào đang được mượn không
    const borrowedCopies = await BookCopy.count({
        where: { status: 'borrowed' },
        include: [{
            model: BookEdition,
            as: 'bookEdition',
            where: { book_id: book.id }
        }]
    });

    if (borrowedCopies > 0) {
        throw new AppError(`Không thể xóa. Có ${borrowedCopies} bản sách đang được mượn`, 400);
    }

    await book.destroy(); // Cascade sẽ xóa book_authors, editions, copies

    res.json({
        success: true,
        message: 'Xóa sách thành công'
    });
});

// ===================================================================
// BOOK EDITION (Phiên bản xuất bản) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách editions của một sách
 * @route   GET /api/books/:bookId/editions
 * @access  Public
 */
const getEditions = asyncHandler(async (req, res) => {
    const editions = await BookEdition.findAll({
        where: { book_id: req.params.bookId },
        include: [
            {
                model: Publisher,
                as: 'publisher',
                attributes: ['id', 'name']
            },
            {
                model: BookCopy,
                as: 'copies',
                attributes: ['id', 'copy_number', 'price', 'status']
            }
        ],
        order: [['publish_year', 'DESC']]
    });

    // Lấy thông tin người đang mượn cho các bản sách "borrowed"
    const editionsData = editions.map(e => e.toJSON());

    // Collect all borrowed copy ids
    const borrowedCopyIds = [];
    editionsData.forEach(edition => {
        edition.copies?.forEach(copy => {
            if (copy.status === 'borrowed') {
                borrowedCopyIds.push(copy.id);
            }
        });
    });

    // Fetch borrower info for borrowed copies
    const borrowerMap = {};
    if (borrowedCopyIds.length > 0) {
        const borrowDetails = await BorrowDetail.findAll({
            where: {
                book_copy_id: { [Op.in]: borrowedCopyIds },
                actual_return_date: null
            },
            include: [{
                model: BorrowRequest,
                as: 'borrowRequest',
                where: { status: { [Op.in]: ['borrowed', 'overdue'] } },
                attributes: ['id', 'borrow_date', 'due_date', 'status'],
                include: [{
                    model: LibraryCard,
                    as: 'libraryCard',
                    attributes: ['id'],
                    include: [{
                        model: Reader,
                        as: 'reader',
                        attributes: ['id', 'full_name', 'phone']
                    }]
                }]
            }]
        });

        borrowDetails.forEach(detail => {
            const reader = detail.borrowRequest?.libraryCard?.reader;
            if (reader) {
                borrowerMap[detail.book_copy_id] = {
                    id: reader.id,
                    name: reader.full_name,
                    phone: reader.phone,
                    borrow_date: detail.borrowRequest.borrow_date,
                    due_date: detail.borrowRequest.due_date,
                    request_status: detail.borrowRequest.status
                };
            }
        });
    }

    // Gắn thông tin borrower vào copies
    const result = editionsData.map(edition => ({
        ...edition,
        copies: edition.copies?.map(copy => ({
            ...copy,
            borrower: borrowerMap[copy.id] || null
        }))
    }));

    res.json({
        success: true,
        data: result
    });
});

/**
 * @desc    Thêm edition mới cho sách
 * @route   POST /api/books/:bookId/editions
 * @access  Admin, Librarian
 */
const createEdition = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { publisher_id, publish_year, isbn } = req.body;

    // Kiểm tra sách tồn tại
    const book = await Book.findByPk(bookId);
    if (!book) {
        throw new AppError('Không tìm thấy sách', 404);
    }

    // Kiểm tra NXB tồn tại
    const publisher = await Publisher.findByPk(publisher_id);
    if (!publisher) {
        throw new AppError('Không tìm thấy nhà xuất bản', 404);
    }

    const edition = await BookEdition.create({
        book_id: bookId,
        publisher_id,
        publish_year,
        isbn
    });

    const createdEdition = await BookEdition.findByPk(edition.id, {
        include: [{ model: Publisher, as: 'publisher' }]
    });

    res.status(201).json({
        success: true,
        message: 'Thêm phiên bản xuất bản thành công',
        data: createdEdition
    });
});

/**
 * @desc    Cập nhật edition
 * @route   PUT /api/editions/:id
 * @access  Admin, Librarian
 */
const updateEdition = asyncHandler(async (req, res) => {
    const edition = await BookEdition.findByPk(req.params.id);

    if (!edition) {
        throw new AppError('Không tìm thấy phiên bản', 404);
    }

    const { publisher_id, publish_year, isbn } = req.body;
    await edition.update({ publisher_id, publish_year, isbn });

    const updatedEdition = await BookEdition.findByPk(edition.id, {
        include: [{ model: Publisher, as: 'publisher' }]
    });

    res.json({
        success: true,
        message: 'Cập nhật phiên bản thành công',
        data: updatedEdition
    });
});

/**
 * @desc    Xóa edition
 * @route   DELETE /api/editions/:id
 * @access  Admin only
 */
const deleteEdition = asyncHandler(async (req, res) => {
    const edition = await BookEdition.findByPk(req.params.id);

    if (!edition) {
        throw new AppError('Không tìm thấy phiên bản', 404);
    }

    // Kiểm tra có bản sách đang mượn không
    const borrowedCount = await BookCopy.count({
        where: {
            book_edition_id: edition.id,
            status: 'borrowed'
        }
    });

    if (borrowedCount > 0) {
        throw new AppError(`Không thể xóa. Có ${borrowedCount} bản sách đang được mượn`, 400);
    }

    await edition.destroy(); // Cascade xóa copies

    res.json({
        success: true,
        message: 'Xóa phiên bản thành công'
    });
});

// ===================================================================
// BOOK COPY (Bản sách) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách bản sách (có filter)
 * @route   GET /api/copies
 * @access  Admin, Librarian, Reader (chỉ xem available copies)
 */
const getAllCopies = asyncHandler(async (req, res) => {
    const { edition_id, status, limit = 100 } = req.query;
    const where = {};

    if (edition_id) {
        where.book_edition_id = edition_id;
    }

    // Reader chỉ được xem available copies
    if (req.user.role === 'reader') {
        where.status = 'available';
    } else if (status) {
        // Admin/Librarian có thể xem tất cả status
        where.status = status;
    }

    const copies = await BookCopy.findAll({
        where,
        include: [{
            model: BookEdition,
            as: 'bookEdition',
            include: [{
                model: Book,
                as: 'book',
                attributes: ['id', 'code', 'title']
            }]
        }],
        order: [['copy_number', 'ASC']],
        limit: parseInt(limit)
    });

    res.json({
        success: true,
        data: copies
    });
});

/**
 * @desc    Lấy danh sách bản sách của một edition
 * @route   GET /api/editions/:editionId/copies
 * @access  Admin, Librarian
 */
const getCopies = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const where = { book_edition_id: req.params.editionId };

    // Filter theo status nếu có
    if (status) {
        where.status = status;
    }

    const copies = await BookCopy.findAll({
        where,
        order: [['copy_number', 'ASC']]
    });

    res.json({
        success: true,
        data: copies
    });
});

/**
 * @desc    Thêm bản sách mới
 * @route   POST /api/editions/:editionId/copies
 * @access  Admin, Librarian
 */
const createCopies = asyncHandler(async (req, res) => {
    const { editionId } = req.params;
    const { quantity = 1, price, condition_notes } = req.body;

    // Kiểm tra edition tồn tại
    const edition = await BookEdition.findByPk(editionId);
    if (!edition) {
        throw new AppError('Không tìm thấy phiên bản sách', 404);
    }

    // Nếu không có price, lấy giá từ copy đầu tiên của edition này (nếu có)
    let finalPrice = price;
    if (!finalPrice) {
        const existingCopy = await BookCopy.findOne({
            where: { book_edition_id: editionId },
            order: [['copy_number', 'ASC']]
        });
        if (existingCopy) {
            finalPrice = existingCopy.price;
        } else {
            // Nếu không có copy nào, dùng giá mặc định
            finalPrice = 50000;
        }
    }

    // Lấy số thứ tự cao nhất hiện tại
    const maxCopy = await BookCopy.findOne({
        where: { book_edition_id: editionId },
        order: [['copy_number', 'DESC']]
    });
    const startNumber = (maxCopy?.copy_number || 0) + 1;

    // Tạo các bản sách
    const copies = [];
    for (let i = 0; i < quantity; i++) {
        copies.push({
            book_edition_id: editionId,
            copy_number: startNumber + i,
            price: finalPrice,
            status: 'available',
            condition_notes
        });
    }

    const createdCopies = await BookCopy.bulkCreate(copies);

    res.status(201).json({
        success: true,
        message: `Thêm ${quantity} bản sách thành công`,
        data: createdCopies
    });
});

/**
 * @desc    Cập nhật bản sách (trạng thái, giá, ghi chú)
 * @route   PUT /api/copies/:id
 * @access  Admin, Librarian
 */
const updateCopy = asyncHandler(async (req, res) => {
    const copy = await BookCopy.findByPk(req.params.id);

    if (!copy) {
        throw new AppError('Không tìm thấy bản sách', 404);
    }

    const { status, price, condition_notes } = req.body;

    // Thủ thư không được đổi sang 'disposed' (thanh lý)
    if (status === 'disposed' && req.user.role !== 'admin') {
        throw new AppError('Chỉ Admin mới được thanh lý sách', 403);
    }

    // Không được đổi trạng thái nếu sách đang mượn
    if (copy.status === 'borrowed' && status && status !== 'borrowed') {
        throw new AppError('Không thể đổi trạng thái sách đang mượn', 400);
    }

    await copy.update({ status, price, condition_notes });

    res.json({
        success: true,
        message: 'Cập nhật bản sách thành công',
        data: copy
    });
});

/**
 * @desc    Xóa bản sách (chỉ khi không đang mượn)
 * @route   DELETE /api/copies/:id
 * @access  Admin, Librarian
 */
const deleteCopy = asyncHandler(async (req, res) => {
    const copy = await BookCopy.findByPk(req.params.id);

    if (!copy) {
        throw new AppError('Không tìm thấy bản sách', 404);
    }

    if (copy.status === 'borrowed') {
        throw new AppError('Không thể xóa sách đang mượn', 400);
    }

    await copy.destroy();

    res.json({
        success: true,
        message: 'Xóa bản sách thành công'
    });
});

/**
 * @desc    Thanh lý bản sách
 * @route   PUT /api/copies/:id/dispose
 * @access  Admin only
 */
const disposeCopy = asyncHandler(async (req, res) => {
    const copy = await BookCopy.findByPk(req.params.id);

    if (!copy) {
        throw new AppError('Không tìm thấy bản sách', 404);
    }

    if (copy.status === 'borrowed') {
        throw new AppError('Không thể thanh lý sách đang mượn', 400);
    }

    await copy.update({
        status: 'disposed',
        condition_notes: req.body.reason || 'Thanh lý'
    });

    res.json({
        success: true,
        message: 'Thanh lý sách thành công',
        data: copy
    });
});

module.exports = {
    // Book
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,

    // Edition
    getEditions,
    createEdition,
    updateEdition,
    deleteEdition,

    // Copy
    getAllCopies,
    getCopies,
    createCopies,
    updateCopy,
    deleteCopy,
    disposeCopy
};
