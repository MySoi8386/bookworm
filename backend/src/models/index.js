/**
 * ===================================================================
 * MODELS INDEX - Khởi tạo và thiết lập quan hệ giữa các models
 * ===================================================================
 * File này thực hiện:
 * 1. Kết nối với database MySQL qua Sequelize
 * 2. Import tất cả các models
 * 3. Thiết lập các quan hệ (associations) giữa các bảng
 * 4. Export sequelize instance và tất cả models
 * ===================================================================
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Lấy cấu hình theo môi trường
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Khởi tạo Sequelize instance
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: dbConfig.pool
    }
);

// ===================================================================
// IMPORT TẤT CẢ MODELS
// ===================================================================

const UserGroup = require('./UserGroup')(sequelize);
const Account = require('./Account')(sequelize);
const Staff = require('./Staff')(sequelize);
const Reader = require('./Reader')(sequelize);
const LibraryCard = require('./LibraryCard')(sequelize);
const Field = require('./Field')(sequelize);
const Genre = require('./Genre')(sequelize);
const Publisher = require('./Publisher')(sequelize);
const Author = require('./Author')(sequelize);
const Book = require('./Book')(sequelize);
const BookAuthor = require('./BookAuthor')(sequelize);
const BookEdition = require('./BookEdition')(sequelize);
const BookCopy = require('./BookCopy')(sequelize);
const BorrowRequest = require('./BorrowRequest')(sequelize);
const BorrowDetail = require('./BorrowDetail')(sequelize);
const Fine = require('./Fine')(sequelize);
const Reminder = require('./Reminder')(sequelize);
const DepositTransaction = require('./DepositTransaction')(sequelize);
const SystemSetting = require('./SystemSetting')(sequelize);

// ===================================================================
// THIẾT LẬP QUAN HỆ GIỮA CÁC BẢNG
// ===================================================================

/**
 * UserGroup - Account (1:N)
 * Một nhóm có nhiều tài khoản
 */
UserGroup.hasMany(Account, { foreignKey: 'group_id', as: 'accounts' });
Account.belongsTo(UserGroup, { foreignKey: 'group_id', as: 'userGroup' });

/**
 * Account - Staff (1:1)
 * Mỗi nhân viên có một tài khoản
 */
Account.hasOne(Staff, { foreignKey: 'account_id', as: 'staff' });
Staff.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

/**
 * Account - Reader (1:1)
 * Mỗi độc giả có một tài khoản
 */
Account.hasOne(Reader, { foreignKey: 'account_id', as: 'reader' });
Reader.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

/**
 * Reader - LibraryCard (1:1)
 * Mỗi độc giả có một thẻ thư viện
 */
Reader.hasOne(LibraryCard, { foreignKey: 'reader_id', as: 'libraryCard' });
LibraryCard.belongsTo(Reader, { foreignKey: 'reader_id', as: 'reader' });

/**
 * Field - Book (1:N)
 * Một lĩnh vực có nhiều sách
 */
Field.hasMany(Book, { foreignKey: 'field_id', as: 'books' });
Book.belongsTo(Field, { foreignKey: 'field_id', as: 'field' });

/**
 * Genre - Book (1:N)
 * Một thể loại có nhiều sách
 */
Genre.hasMany(Book, { foreignKey: 'genre_id', as: 'books' });
Book.belongsTo(Genre, { foreignKey: 'genre_id', as: 'genre' });

/**
 * Book - Author (N:M) thông qua BookAuthor
 * Một sách có nhiều tác giả, một tác giả viết nhiều sách
 */
Book.belongsToMany(Author, {
    through: BookAuthor,
    foreignKey: 'book_id',
    otherKey: 'author_id',
    as: 'authors'
});
Author.belongsToMany(Book, {
    through: BookAuthor,
    foreignKey: 'author_id',
    otherKey: 'book_id',
    as: 'books'
});

// Quan hệ trực tiếp với bảng trung gian
Book.hasMany(BookAuthor, { foreignKey: 'book_id', as: 'bookAuthors' });
BookAuthor.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
Author.hasMany(BookAuthor, { foreignKey: 'author_id', as: 'bookAuthors' });
BookAuthor.belongsTo(Author, { foreignKey: 'author_id', as: 'author' });

/**
 * Book - BookEdition (1:N)
 * Một đầu sách có nhiều phiên bản xuất bản
 */
Book.hasMany(BookEdition, { foreignKey: 'book_id', as: 'editions' });
BookEdition.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

/**
 * Publisher - BookEdition (1:N)
 * Một NXB xuất bản nhiều phiên bản
 */
Publisher.hasMany(BookEdition, { foreignKey: 'publisher_id', as: 'editions' });
BookEdition.belongsTo(Publisher, { foreignKey: 'publisher_id', as: 'publisher' });

/**
 * BookEdition - BookCopy (1:N)
 * Một phiên bản có nhiều bản sách
 */
BookEdition.hasMany(BookCopy, { foreignKey: 'book_edition_id', as: 'copies' });
BookCopy.belongsTo(BookEdition, { foreignKey: 'book_edition_id', as: 'bookEdition' });

/**
 * LibraryCard - BorrowRequest (1:N)
 * Một thẻ có nhiều phiếu mượn
 */
LibraryCard.hasMany(BorrowRequest, { foreignKey: 'library_card_id', as: 'borrowRequests' });
BorrowRequest.belongsTo(LibraryCard, { foreignKey: 'library_card_id', as: 'libraryCard' });

/**
 * Account - BorrowRequest (1:N)
 * Một tài khoản tạo nhiều phiếu mượn
 */
Account.hasMany(BorrowRequest, { foreignKey: 'account_id', as: 'borrowRequests' });
BorrowRequest.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

/**
 * Staff - BorrowRequest (1:N) - Người duyệt
 * Một nhân viên duyệt nhiều phiếu mượn
 */
Staff.hasMany(BorrowRequest, { foreignKey: 'approved_by', as: 'approvedRequests' });
BorrowRequest.belongsTo(Staff, { foreignKey: 'approved_by', as: 'approver' });

/**
 * BorrowRequest - BorrowDetail (1:N)
 * Một phiếu mượn có nhiều chi tiết
 */
BorrowRequest.hasMany(BorrowDetail, { foreignKey: 'borrow_request_id', as: 'details' });
BorrowDetail.belongsTo(BorrowRequest, { foreignKey: 'borrow_request_id', as: 'borrowRequest' });

/**
 * BookCopy - BorrowDetail (1:N)
 * Một bản sách có thể nằm trong nhiều chi tiết mượn (theo thời gian)
 */
BookCopy.hasMany(BorrowDetail, { foreignKey: 'book_copy_id', as: 'borrowDetails' });
BorrowDetail.belongsTo(BookCopy, { foreignKey: 'book_copy_id', as: 'bookCopy' });

/**
 * BorrowRequest - Fine (1:N)
 * Một phiếu mượn có thể có nhiều phiếu phạt
 */
BorrowRequest.hasMany(Fine, { foreignKey: 'borrow_request_id', as: 'fines' });
Fine.belongsTo(BorrowRequest, { foreignKey: 'borrow_request_id', as: 'borrowRequest' });

/**
 * BookCopy - Fine (1:N)
 * Một bản sách có thể bị phạt nhiều lần
 */
BookCopy.hasMany(Fine, { foreignKey: 'book_copy_id', as: 'fines' });
Fine.belongsTo(BookCopy, { foreignKey: 'book_copy_id', as: 'bookCopy' });

/**
 * Staff - Fine (1:N) - Người thu tiền
 * Một nhân viên thu nhiều phiếu phạt
 */
Staff.hasMany(Fine, { foreignKey: 'collected_by', as: 'collectedFines' });
Fine.belongsTo(Staff, { foreignKey: 'collected_by', as: 'collector' });

/**
 * BorrowRequest - Reminder (1:N)
 * Một phiếu mượn có thể nhận nhiều phiếu nhắc
 */
BorrowRequest.hasMany(Reminder, { foreignKey: 'borrow_request_id', as: 'reminders' });
Reminder.belongsTo(BorrowRequest, { foreignKey: 'borrow_request_id', as: 'borrowRequest' });

/**
 * LibraryCard - DepositTransaction (1:N)
 * Một thẻ có nhiều giao dịch cọc
 */
LibraryCard.hasMany(DepositTransaction, { foreignKey: 'library_card_id', as: 'depositTransactions' });
DepositTransaction.belongsTo(LibraryCard, { foreignKey: 'library_card_id', as: 'libraryCard' });

/**
 * Staff - DepositTransaction (1:N)
 * Một nhân viên thực hiện nhiều giao dịch
 */
Staff.hasMany(DepositTransaction, { foreignKey: 'staff_id', as: 'depositTransactions' });
DepositTransaction.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });

// ===================================================================
// EXPORT TẤT CẢ
// ===================================================================

module.exports = {
    sequelize,
    Sequelize,

    // Models
    UserGroup,
    Account,
    Staff,
    Reader,
    LibraryCard,
    Field,
    Genre,
    Publisher,
    Author,
    Book,
    BookAuthor,
    BookEdition,
    BookCopy,
    BorrowRequest,
    BorrowDetail,
    Fine,
    Reminder,
    DepositTransaction,
    SystemSetting
};
