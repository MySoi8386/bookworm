/**
 * ===================================================================
 * SEEDER: DỮ LIỆU MẪU CHUẨN
 * ===================================================================
 * Phiên bản: 2.0
 * Cập nhật: 2026-01-20
 * 
 * Thay đổi:
 * - Xóa page_count, size từ books
 * - Thêm established_date cho publishers
 * - 1 phiếu mượn = 1 sách
 * - Sách mất → status 'disposed'
 * ===================================================================
 */

'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // ===================================================================
        // 0. DỌN SẠCH DỮ LIỆU (RESET TOÀN BỘ BẢNG THEO THỨ TỰ KHÓA NGOẠI)
        // ===================================================================
        // Xóa từ bảng con → bảng cha để tránh lỗi ràng buộc khóa ngoại
        await queryInterface.bulkDelete('reminders', null, {});
        await queryInterface.bulkDelete('fines', null, {});
        await queryInterface.bulkDelete('borrow_details', null, {});
        await queryInterface.bulkDelete('borrow_requests', null, {});
        await queryInterface.bulkDelete('book_copies', null, {});
        await queryInterface.bulkDelete('book_editions', null, {});
        await queryInterface.bulkDelete('book_authors', null, {});
        await queryInterface.bulkDelete('books', null, {});
        await queryInterface.bulkDelete('authors', null, {});
        await queryInterface.bulkDelete('publishers', null, {});
        await queryInterface.bulkDelete('genres', null, {});
        await queryInterface.bulkDelete('fields', null, {});
        await queryInterface.bulkDelete('system_settings', null, {});
        await queryInterface.bulkDelete('deposit_transactions', null, {});
        await queryInterface.bulkDelete('library_cards', null, {});
        await queryInterface.bulkDelete('readers', null, {});
        await queryInterface.bulkDelete('staffs', null, {});
        await queryInterface.bulkDelete('accounts', null, {});
        await queryInterface.bulkDelete('user_groups', null, {});

        // ===================================================================
        // 1. USER GROUPS
        // ===================================================================
        await queryInterface.bulkInsert('user_groups', [
            { name: 'admin', description: 'Quản trị viên', created_at: now, updated_at: now },
            { name: 'librarian', description: 'Thủ thư', created_at: now, updated_at: now },
            { name: 'reader', description: 'Độc giả', created_at: now, updated_at: now }
        ]);

        const [groups] = await queryInterface.sequelize.query("SELECT id, name FROM user_groups");
        const adminGroupId = groups.find(g => g.name === 'admin').id;
        const librarianGroupId = groups.find(g => g.name === 'librarian').id;
        const readerGroupId = groups.find(g => g.name === 'reader').id;

        // ===================================================================
        // 2. ACCOUNTS
        // ===================================================================
        await queryInterface.bulkInsert('accounts', [
            // Admin & Librarian
            { group_id: adminGroupId, username: 'admin', password: hashedPassword, email: 'admin@library.com', status: 'active', created_at: now, updated_at: now },
            { group_id: librarianGroupId, username: 'librarian', password: hashedPassword, email: 'librarian@library.com', status: 'active', created_at: now, updated_at: now },
            // Readers (10 accounts)
            { group_id: readerGroupId, username: 'reader001', password: hashedPassword, email: 'reader001@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader002', password: hashedPassword, email: 'reader002@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader003', password: hashedPassword, email: 'reader003@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader004', password: hashedPassword, email: 'reader004@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader005', password: hashedPassword, email: 'reader005@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader006', password: hashedPassword, email: 'reader006@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader007', password: hashedPassword, email: 'reader007@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader008', password: hashedPassword, email: 'reader008@gmail.com', status: 'active', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader009', password: hashedPassword, email: 'reader009@gmail.com', status: 'locked', created_at: now, updated_at: now },
            { group_id: readerGroupId, username: 'reader010', password: hashedPassword, email: 'reader010@gmail.com', status: 'active', created_at: now, updated_at: now }
        ]);

        const [accounts] = await queryInterface.sequelize.query("SELECT id, username FROM accounts ORDER BY id");
        const adminAccountId = accounts.find(a => a.username === 'admin').id;
        const librarianAccountId = accounts.find(a => a.username === 'librarian').id;
        const readerAccountIds = accounts.filter(a => a.username.startsWith('reader')).map(a => a.id);

        // ===================================================================
        // 3. STAFFS
        // ===================================================================
        await queryInterface.bulkInsert('staffs', [
            { account_id: adminAccountId, full_name: 'Quản trị viên', position: 'Admin', phone: '0901234567', address: 'Hà Nội', created_at: now, updated_at: now },
            { account_id: librarianAccountId, full_name: 'Nguyễn Văn Thủ Thư', position: 'Thủ thư', phone: '0907654321', address: 'Hà Nội', created_at: now, updated_at: now }
        ]);

        const [staffs] = await queryInterface.sequelize.query("SELECT id, account_id FROM staffs");
        const adminStaffId = staffs.find(s => s.account_id === adminAccountId).id;
        const librarianStaffId = staffs.find(s => s.account_id === librarianAccountId).id;

        // ===================================================================
        // 4. READERS
        // ===================================================================
        const readerNames = [
            'Trần Văn An', 'Nguyễn Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
            'Vũ Thị Phượng', 'Đỗ Văn Giang', 'Bùi Thị Hoa', 'Ngô Văn Ích', 'Dương Thị Kim'
        ];

        const readers = readerAccountIds.map((accountId, idx) => ({
            account_id: accountId,
            id_card_number: `0${String(79000000001 + idx)}`, // CCCD giả lập
            full_name: readerNames[idx],
            phone: `090${String(idx + 1).padStart(7, '0')}`,
            address: `${idx % 2 === 0 ? 'Hà Nội' : 'TP.HCM'}`,
            created_at: now,
            updated_at: now
        }));
        await queryInterface.bulkInsert('readers', readers);

        const [readersData] = await queryInterface.sequelize.query("SELECT id, account_id FROM readers ORDER BY id");

        // ===================================================================
        // 5. LIBRARY CARDS
        // ===================================================================
        const libraryCards = readersData.map((reader, idx) => {
            const issueDate = new Date(2024, 0, idx + 1);
            const expiryDate = new Date(2025, 0, idx + 1);
            return {
                reader_id: reader.id,
                card_number: `LIB${String(idx + 1).padStart(6, '0')}`,
                issue_date: issueDate,
                expiry_date: expiryDate,
                max_books: 5,
                max_borrow_days: 14,
                deposit_amount: 200000,
                status: idx === 8 ? 'locked' : 'active', // Reader009 locked
                created_at: now,
                updated_at: now
            };
        });
        await queryInterface.bulkInsert('library_cards', libraryCards);

        const [libraryCardsData] = await queryInterface.sequelize.query("SELECT id, reader_id, card_number FROM library_cards ORDER BY id");

        // ===================================================================
        // 6. DEPOSIT TRANSACTIONS
        // ===================================================================
        const depositTxs = libraryCardsData.slice(0, 8).map((card, idx) => ({
            library_card_id: card.id,
            amount: 200000,
            type: 'deposit', // Sửa từ transaction_type sang type
            staff_id: librarianStaffId,
            notes: 'Tiền cọc ban đầu',
            transaction_date: new Date(2024, 0, idx + 1),
            created_at: now,
            updated_at: now
        }));
        await queryInterface.bulkInsert('deposit_transactions', depositTxs);

        // ===================================================================
        // 7. SYSTEM SETTINGS
        // ===================================================================
        await queryInterface.bulkInsert('system_settings', [
            { setting_key: 'max_books_per_user', setting_value: '5', description: 'Số sách tối đa được mượn', created_at: now, updated_at: now },
            { setting_key: 'max_borrow_days', setting_value: '14', description: 'Số ngày mượn tối đa', created_at: now, updated_at: now },
            { setting_key: 'fine_rate_percent', setting_value: '5', description: 'Phí phạt quá hạn (% giá sách/ngày)', created_at: now, updated_at: now },
            { setting_key: 'min_deposit_amount', setting_value: '200000', description: 'Số tiền cọc tối thiểu (VNĐ)', created_at: now, updated_at: now }
        ]);

        // ===================================================================
        // 8. FIELDS
        // ===================================================================
        await queryInterface.bulkInsert('fields', [
            { name: 'Công nghệ thông tin', code: 'CNTT', created_at: now, updated_at: now },
            { name: 'Kinh tế', code: 'KT', created_at: now, updated_at: now },
            { name: 'Văn học', code: 'VH', created_at: now, updated_at: now },
            { name: 'Khoa học tự nhiên', code: 'KHTN', created_at: now, updated_at: now },
            { name: 'Lịch sử', code: 'LS', created_at: now, updated_at: now },
            { name: 'Ngoại ngữ', code: 'NN', created_at: now, updated_at: now },
            { name: 'Nghệ thuật', code: 'NT', created_at: now, updated_at: now },
            { name: 'Khoa học xã hội', code: 'KHXH', created_at: now, updated_at: now }
        ]);

        const [fields] = await queryInterface.sequelize.query("SELECT id, name FROM fields");

        // ===================================================================
        // 9. GENRES
        // ===================================================================
        await queryInterface.bulkInsert('genres', [
            { code: 'GT', name: 'Giáo trình', created_at: now, updated_at: now },
            { code: 'TK', name: 'Tham khảo', created_at: now, updated_at: now },
            { code: 'TT', name: 'Tiểu thuyết', created_at: now, updated_at: now },
            { code: 'TN', name: 'Truyện ngắn', created_at: now, updated_at: now },
            { code: 'KH', name: 'Khoa học', created_at: now, updated_at: now },
            { code: 'KN', name: 'Kỹ năng', created_at: now, updated_at: now },
            { code: 'TH', name: 'Thiếu nhi', created_at: now, updated_at: now },
            { code: 'TD', name: 'Từ điển', created_at: now, updated_at: now }
        ]);

        const [genres] = await queryInterface.sequelize.query("SELECT id, name FROM genres");

        // ===================================================================
        // 10. PUBLISHERS (có established_date)
        // ===================================================================
        await queryInterface.bulkInsert('publishers', [
            { name: 'NXB Giáo dục Việt Nam', address: 'Hà Nội', established_date: '1957-06-01', phone: '024-3822-0801', email: 'info@nxbgd.vn', created_at: now, updated_at: now },
            { name: 'NXB ĐHQG Hà Nội', address: 'Hà Nội', established_date: '1995-01-15', phone: '024-3858-8125', email: 'contact@vnu.edu.vn', created_at: now, updated_at: now },
            { name: 'NXB ĐHQG TP.HCM', address: 'TP.HCM', established_date: '1996-09-01', phone: '028-3724-5924', email: 'info@vnuhcm.edu.vn', created_at: now, updated_at: now },
            { name: 'NXB Khoa học và Kỹ thuật', address: 'Hà Nội', established_date: '1960-08-20', phone: '024-3822-3596', email: 'nxbkhkt@hn.vnn.vn', created_at: now, updated_at: now },
            { name: 'NXB Trẻ', address: 'TP.HCM', established_date: '1981-04-08', phone: '028-3930-2002', email: 'hopthubandoc@nxbtre.com.vn', created_at: now, updated_at: now },
            { name: 'NXB Kim Đồng', address: 'Hà Nội', established_date: '1957-06-01', phone: '024-3942-2916', email: 'nxbkimdong@hn.vnn.vn', created_at: now, updated_at: now },
            { name: 'NXB Lao động', address: 'Hà Nội', established_date: '1946-10-15', phone: '024-3822-3841', email: 'nxblaodong@hn.vnn.vn', created_at: now, updated_at: now },
            { name: 'NXB Thống kê', address: 'Hà Nội', established_date: '1975-08-01', phone: '024-3826-4111', email: 'nxbthongke@gmail.com', created_at: now, updated_at: now }
        ]);

        const [publishers] = await queryInterface.sequelize.query("SELECT id, name FROM publishers");

        // ===================================================================
        // 11. AUTHORS
        // ===================================================================
        await queryInterface.bulkInsert('authors', [
            { name: 'Nguyễn Nhật Ánh', bio: 'Nhà văn nổi tiếng Việt Nam', created_at: now, updated_at: now },
            { name: 'Nguyễn Du', bio: 'Tác giả Truyện Kiều', created_at: now, updated_at: now },
            { name: 'Tô Hoài', bio: 'Nhà văn thiếu nhi', created_at: now, updated_at: now },
            { name: 'TS. Nguyễn Văn A', bio: 'Chuyên gia CNTT', created_at: now, updated_at: now },
            { name: 'PGS.TS. Lê Văn B', bio: 'Chuyên gia Kinh tế', created_at: now, updated_at: now },
            { name: 'Paulo Coelho', bio: 'Tác giả Nhà giả kim', created_at: now, updated_at: now },
            { name: 'Yuval Noah Harari', bio: 'Tác giả Sapiens', created_at: now, updated_at: now },
            { name: 'Dale Carnegie', bio: 'Tác giả Đắc Nhân Tâm', created_at: now, updated_at: now },
            { name: 'Nguyễn Thị C', bio: 'Giảng viên Toán học', created_at: now, updated_at: now },
            { name: 'Trần Văn D', bio: 'Chuyên gia Vật lý', created_at: now, updated_at: now }
        ]);

        const [authors] = await queryInterface.sequelize.query("SELECT id, name FROM authors");

        // ===================================================================
        // 12. BOOKS (KHÔNG có page_count, size)
        // ===================================================================
        const cnttField = fields.find(f => f.name === 'Công nghệ thông tin').id;
        const ktField = fields.find(f => f.name === 'Kinh tế').id;
        const vhField = fields.find(f => f.name === 'Văn học').id;
        const khtnField = fields.find(f => f.name === 'Khoa học tự nhiên').id;

        const giaoTrinhGenre = genres.find(g => g.name === 'Giáo trình').id;
        const thamKhaoGenre = genres.find(g => g.name === 'Tham khảo').id;
        const tieuThuyetGenre = genres.find(g => g.name === 'Tiểu thuyết').id;
        const kyNangGenre = genres.find(g => g.name === 'Kỹ năng').id;

        await queryInterface.bulkInsert('books', [
            { code: 'CNTT001', title: 'Lập trình Java cơ bản', field_id: cnttField, genre_id: giaoTrinhGenre, description: 'Giáo trình lập trình Java cho người mới bắt đầu', created_at: now, updated_at: now },
            { code: 'CNTT002', title: 'Cấu trúc dữ liệu và giải thuật', field_id: cnttField, genre_id: giaoTrinhGenre, description: 'Giáo trình về CTDL&GT', created_at: now, updated_at: now },
            { code: 'CNTT003', title: 'Trí tuệ nhân tạo', field_id: cnttField, genre_id: thamKhaoGenre, description: 'Nhập môn AI và Machine Learning', created_at: now, updated_at: now },
            { code: 'KT001', title: 'Kinh tế học vi mô', field_id: ktField, genre_id: giaoTrinhGenre, description: 'Giáo trình kinh tế vi mô', created_at: now, updated_at: now },
            { code: 'KT002', title: 'Quản trị doanh nghiệp', field_id: ktField, genre_id: thamKhaoGenre, description: 'Các nguyên lý quản trị cơ bản', created_at: now, updated_at: now },
            { code: 'VH001', title: 'Truyện Kiều', field_id: vhField, genre_id: tieuThuyetGenre, description: 'Tác phẩm kinh điển của Nguyễn Du', created_at: now, updated_at: now },
            { code: 'VH002', title: 'Dế mèn phiêu lưu ký', field_id: vhField, genre_id: tieuThuyetGenre, description: 'Truyện thiếu nhi của Tô Hoài', created_at: now, updated_at: now },
            { code: 'VH003', title: 'Cho tôi xin một vé đi tuổi thơ', field_id: vhField, genre_id: tieuThuyetGenre, description: 'Tiểu thuyết của Nguyễn Nhật Ánh', created_at: now, updated_at: now },
            { code: 'KHTN001', title: 'Vật lý đại cương', field_id: khtnField, genre_id: giaoTrinhGenre, description: 'Giáo trình vật lý cơ bản', created_at: now, updated_at: now },
            { code: 'KHTN002', title: 'Hóa học hữu cơ', field_id: khtnField, genre_id: giaoTrinhGenre, description: 'Giáo trình hóa học hữu cơ', created_at: now, updated_at: now },
            { code: 'KN001', title: 'Đắc nhân tâm', field_id: ktField, genre_id: kyNangGenre, description: 'Nghệ thuật giao tiếp và ứng xử', created_at: now, updated_at: now },
            { code: 'KN002', title: 'Sapiens - Lược sử loài người', field_id: khtnField, genre_id: thamKhaoGenre, description: 'Lịch sử tiến hóa của loài người', created_at: now, updated_at: now },
            { code: 'KN003', title: 'Nhà giả kim', field_id: vhField, genre_id: tieuThuyetGenre, description: 'Tiểu thuyết về hành trình tìm kiếm giấc mơ', created_at: now, updated_at: now },
            { code: 'CNTT004', title: 'Python cho khoa học dữ liệu', field_id: cnttField, genre_id: thamKhaoGenre, description: 'Lập trình Python cho Data Science', created_at: now, updated_at: now },
            { code: 'CNTT005', title: 'Lập trình web với React', field_id: cnttField, genre_id: thamKhaoGenre, description: 'Xây dựng ứng dụng web hiện đại với React', created_at: now, updated_at: now }
        ]);

        const [books] = await queryInterface.sequelize.query("SELECT id, code, title FROM books ORDER BY id");

        // ===================================================================
        // 13. BOOK_AUTHORS
        // ===================================================================
        const bookAuthors = [
            { book_id: books[0].id, author_id: authors[3].id, created_at: now }, // Java - TS Nguyễn Văn A
            { book_id: books[1].id, author_id: authors[3].id, created_at: now }, // CTDL - TS Nguyễn Văn A
            { book_id: books[2].id, author_id: authors[3].id, created_at: now }, // AI - TS Nguyễn Văn A
            { book_id: books[3].id, author_id: authors[4].id, created_at: now }, // Kinh tế vi mô - PGS Lê Văn B
            { book_id: books[4].id, author_id: authors[4].id, created_at: now }, // Quản trị - PGS Lê Văn B
            { book_id: books[5].id, author_id: authors[1].id, created_at: now }, // Truyện Kiều - Nguyễn Du
            { book_id: books[6].id, author_id: authors[2].id, created_at: now }, // Dế mèn - Tô Hoài
            { book_id: books[7].id, author_id: authors[0].id, created_at: now }, // Vé đi tuổi thơ - Nguyễn Nhật Ánh
            { book_id: books[8].id, author_id: authors[9].id, created_at: now }, // Vật lý - Trần Văn D
            { book_id: books[9].id, author_id: authors[8].id, created_at: now }, // Hóa học - Nguyễn Thị C
            { book_id: books[10].id, author_id: authors[7].id, created_at: now }, // Đắc nhân tâm - Dale Carnegie
            { book_id: books[11].id, author_id: authors[6].id, created_at: now }, // Sapiens - Yuval Noah Harari
            { book_id: books[12].id, author_id: authors[5].id, created_at: now }, // Nhà giả kim - Paulo Coelho
            { book_id: books[13].id, author_id: authors[3].id, created_at: now }, // Python - TS Nguyễn Văn A
            { book_id: books[14].id, author_id: authors[3].id, created_at: now }  // React - TS Nguyễn Văn A
        ];
        await queryInterface.bulkInsert('book_authors', bookAuthors);

        // ===================================================================
        // 14. BOOK_EDITIONS
        // ===================================================================
        const nxbGD = publishers.find(p => p.name === 'NXB Giáo dục Việt Nam').id;
        const nxbDHQGHN = publishers.find(p => p.name === 'NXB ĐHQG Hà Nội').id;
        const nxbTre = publishers.find(p => p.name === 'NXB Trẻ').id;
        const nxbKimDong = publishers.find(p => p.name === 'NXB Kim Đồng').id;
        const nxbKHKT = publishers.find(p => p.name === 'NXB Khoa học và Kỹ thuật').id;

        await queryInterface.bulkInsert('book_editions', [
            { book_id: books[0].id, publisher_id: nxbGD, publish_year: 2023, isbn: '978-604-00-0001-1', created_at: now, updated_at: now },
            { book_id: books[0].id, publisher_id: nxbDHQGHN, publish_year: 2024, isbn: '978-604-00-0001-2', created_at: now, updated_at: now },
            { book_id: books[1].id, publisher_id: nxbDHQGHN, publish_year: 2023, isbn: '978-604-00-0002-1', created_at: now, updated_at: now },
            { book_id: books[2].id, publisher_id: nxbKHKT, publish_year: 2024, isbn: '978-604-00-0003-1', created_at: now, updated_at: now },
            { book_id: books[3].id, publisher_id: nxbGD, publish_year: 2023, isbn: '978-604-00-0004-1', created_at: now, updated_at: now },
            { book_id: books[4].id, publisher_id: nxbGD, publish_year: 2024, isbn: '978-604-00-0005-1', created_at: now, updated_at: now },
            { book_id: books[5].id, publisher_id: nxbGD, publish_year: 2020, isbn: '978-604-00-0006-1', created_at: now, updated_at: now },
            { book_id: books[6].id, publisher_id: nxbKimDong, publish_year: 2021, isbn: '978-604-00-0007-1', created_at: now, updated_at: now },
            { book_id: books[7].id, publisher_id: nxbTre, publish_year: 2022, isbn: '978-604-00-0008-1', created_at: now, updated_at: now },
            { book_id: books[8].id, publisher_id: nxbGD, publish_year: 2023, isbn: '978-604-00-0009-1', created_at: now, updated_at: now },
            { book_id: books[9].id, publisher_id: nxbGD, publish_year: 2023, isbn: '978-604-00-0010-1', created_at: now, updated_at: now },
            { book_id: books[10].id, publisher_id: nxbTre, publish_year: 2023, isbn: '978-604-00-0011-1', created_at: now, updated_at: now },
            { book_id: books[11].id, publisher_id: nxbTre, publish_year: 2024, isbn: '978-604-00-0012-1', created_at: now, updated_at: now },
            { book_id: books[12].id, publisher_id: nxbTre, publish_year: 2023, isbn: '978-604-00-0013-1', created_at: now, updated_at: now },
            { book_id: books[13].id, publisher_id: nxbKHKT, publish_year: 2024, isbn: '978-604-00-0014-1', created_at: now, updated_at: now },
            { book_id: books[14].id, publisher_id: nxbKHKT, publish_year: 2024, isbn: '978-604-00-0015-1', created_at: now, updated_at: now }
        ]);

        const [editions] = await queryInterface.sequelize.query("SELECT id FROM book_editions ORDER BY id");

        // ===================================================================
        // 15. BOOK_COPIES (BẮT BUỘC có price)
        // ===================================================================
        const bookCopies = [];
        let copyCounter = 1;

        // Edition 1: Java NXB GD (4 copies)
        bookCopies.push(
            { book_edition_id: editions[0].id, copy_number: copyCounter++, price: 85000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[0].id, copy_number: copyCounter++, price: 85000, status: 'borrowed', created_at: now, updated_at: now },
            { book_edition_id: editions[0].id, copy_number: copyCounter++, price: 85000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[0].id, copy_number: copyCounter++, price: 85000, status: 'damaged', condition_notes: 'Bìa rách một góc', created_at: now, updated_at: now }
        );

        // Edition 2: Java NXB ĐHQG HN (3 copies)
        copyCounter = 1;
        bookCopies.push(
            { book_edition_id: editions[1].id, copy_number: copyCounter++, price: 120000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[1].id, copy_number: copyCounter++, price: 120000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[1].id, copy_number: copyCounter++, price: 120000, status: 'disposed', condition_notes: '[MẤT SÁCH] Độc giả làm mất ngày 10/01/2026', created_at: now, updated_at: now }
        );

        // Edition 3: CTDL (5 copies)
        copyCounter = 1;
        bookCopies.push(
            { book_edition_id: editions[2].id, copy_number: copyCounter++, price: 95000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[2].id, copy_number: copyCounter++, price: 95000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[2].id, copy_number: copyCounter++, price: 95000, status: 'borrowed', created_at: now, updated_at: now },
            { book_edition_id: editions[2].id, copy_number: copyCounter++, price: 95000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[2].id, copy_number: copyCounter++, price: 95000, status: 'available', created_at: now, updated_at: now }
        );

        // Edition 4: AI (4 copies)
        copyCounter = 1;
        bookCopies.push(
            { book_edition_id: editions[3].id, copy_number: copyCounter++, price: 150000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[3].id, copy_number: copyCounter++, price: 150000, status: 'available', created_at: now, updated_at: now },
            { book_edition_id: editions[3].id, copy_number: copyCounter++, price: 150000, status: 'borrowed', created_at: now, updated_at: now },
            { book_edition_id: editions[3].id, copy_number: copyCounter++, price: 150000, status: 'damaged', condition_notes: 'Nhăn trang, bị nước', created_at: now, updated_at: now }
        );

        // Edition 5-8: Kinh tế (3 copies each)
        for (let i = 4; i < 6; i++) {
            copyCounter = 1;
            for (let j = 0; j < 3; j++) {
                bookCopies.push({
                    book_edition_id: editions[i].id,
                    copy_number: copyCounter++,
                    price: 75000,
                    status: j === 0 ? 'available' : (j === 1 ? 'borrowed' : 'available'),
                    created_at: now,
                    updated_at: now
                });
            }
        }

        // Edition 9-11: Văn học (4 copies each)
        for (let i = 6; i < 9; i++) {
            copyCounter = 1;
            for (let j = 0; j < 4; j++) {
                bookCopies.push({
                    book_edition_id: editions[i].id,
                    copy_number: copyCounter++,
                    price: 60000,
                    status: j === 1 ? 'borrowed' : 'available',
                    created_at: now,
                    updated_at: now
                });
            }
        }

        // Edition 12-13: Khoa học tự nhiên (3 copies each)
        for (let i = 9; i < 11; i++) {
            copyCounter = 1;
            for (let j = 0; j < 3; j++) {
                bookCopies.push({
                    book_edition_id: editions[i].id,
                    copy_number: copyCounter++,
                    price: 80000,
                    status: 'available',
                    created_at: now,
                    updated_at: now
                });
            }
        }

        // Edition 14-16: Kỹ năng/Khác (4 copies each)
        for (let i = 11; i < 16; i++) {
            copyCounter = 1;
            for (let j = 0; j < 4; j++) {
                bookCopies.push({
                    book_edition_id: editions[i].id,
                    copy_number: copyCounter++,
                    price: 100000 + (i * 5000),
                    status: j === 2 ? 'borrowed' : 'available',
                    created_at: now,
                    updated_at: now
                });
            }
        }

        await queryInterface.bulkInsert('book_copies', bookCopies);

        const [copies] = await queryInterface.sequelize.query("SELECT id, status FROM book_copies ORDER BY id");

        // ===================================================================
        // 16. BORROW_REQUESTS (1 phiếu = 1 sách)
        // Dùng ngày động để tránh quá hạn khi chạy seed
        // ===================================================================
        const borrowedCopies = copies.filter(c => c.status === 'borrowed');

        // Tạo ngày động: quá khứ và tương lai tương đối với "now"
        const daysAgo = (days) => {
            const d = new Date(now);
            d.setDate(d.getDate() - days);
            return d;
        };
        const daysFromNow = (days) => {
            const d = new Date(now);
            d.setDate(d.getDate() + days);
            return d;
        };

        const borrowRequests = [];
        borrowRequests.push(
            // Phiếu 1: Đã trả (mượn 20 ngày trước, trả 5 ngày trước)
            { library_card_id: libraryCardsData[0].id, request_date: daysAgo(21), borrow_date: daysAgo(20), due_date: daysAgo(6), status: 'returned', notes: 'Đã trả đúng hạn', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 2: Đang mượn (mượn 3 ngày trước, hạn 10 ngày nữa)
            { library_card_id: libraryCardsData[1].id, request_date: daysAgo(4), borrow_date: daysAgo(3), due_date: daysFromNow(10), status: 'borrowed', notes: '', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 3: Đang mượn (mượn 5 ngày trước, hạn 8 ngày nữa)
            { library_card_id: libraryCardsData[2].id, request_date: daysAgo(6), borrow_date: daysAgo(5), due_date: daysFromNow(8), status: 'borrowed', notes: '', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 4: Quá hạn 5 ngày (mượn 19 ngày trước, hạn 5 ngày trước)
            { library_card_id: libraryCardsData[3].id, request_date: daysAgo(20), borrow_date: daysAgo(19), due_date: daysAgo(5), status: 'overdue', notes: 'Quá hạn', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 5: Chờ duyệt (tạo hôm nay)
            { library_card_id: libraryCardsData[4].id, request_date: now, borrow_date: null, due_date: daysFromNow(14), status: 'pending', notes: '', account_id: readerAccountIds[4], created_at: now, updated_at: now },
            // Phiếu 6: Đã duyệt chờ nhận (tạo hôm qua)
            { library_card_id: libraryCardsData[5].id, request_date: daysAgo(1), borrow_date: null, due_date: daysFromNow(13), status: 'approved', notes: '', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 7: Đang mượn (mượn 7 ngày trước, hạn 6 ngày nữa)
            { library_card_id: libraryCardsData[6].id, request_date: daysAgo(8), borrow_date: daysAgo(7), due_date: daysFromNow(6), status: 'borrowed', notes: '', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now },
            // Phiếu 8: Quá hạn 2 ngày (mượn 16 ngày trước, hạn 2 ngày trước)
            { library_card_id: libraryCardsData[7].id, request_date: daysAgo(17), borrow_date: daysAgo(16), due_date: daysAgo(2), status: 'overdue', notes: 'Quá hạn', account_id: librarianAccountId, approved_by: librarianStaffId, created_at: now, updated_at: now }
        );


        await queryInterface.bulkInsert('borrow_requests', borrowRequests);

        const [borrowRequestsData] = await queryInterface.sequelize.query("SELECT id, status FROM borrow_requests ORDER BY id");

        // ===================================================================
        // 17. BORROW_DETAILS (1-1 với borrow_request)
        // ===================================================================
        const borrowDetails = [];
        let borrowedCopyIdx = 0;

        borrowRequestsData.forEach((request, idx) => {
            if (request.status === 'returned') {
                // Đã trả (5 ngày trước)
                borrowDetails.push({
                    borrow_request_id: request.id,
                    book_copy_id: copies[0].id, // Copy bất kỳ
                    actual_return_date: daysAgo(5),
                    return_condition: 'normal',
                    notes: 'Trả đúng hạn',
                    created_at: now,
                    updated_at: now
                });

            } else if (request.status === 'borrowed' || request.status === 'overdue') {
                // Đang mượn hoặc quá hạn - dùng borrowed copies
                if (borrowedCopyIdx < borrowedCopies.length) {
                    borrowDetails.push({
                        borrow_request_id: request.id,
                        book_copy_id: borrowedCopies[borrowedCopyIdx].id,
                        actual_return_date: null,
                        return_condition: null,
                        notes: '',
                        created_at: now,
                        updated_at: now
                    });
                    borrowedCopyIdx++;
                }
            } else if (request.status === 'pending' || request.status === 'approved') {
                // Chờ duyệt / đã duyệt - chọn copy available
                const availableCopy = copies.find(c => c.status === 'available' && !borrowDetails.find(bd => bd.book_copy_id === c.id));
                if (availableCopy) {
                    borrowDetails.push({
                        borrow_request_id: request.id,
                        book_copy_id: availableCopy.id,
                        actual_return_date: null,
                        return_condition: null,
                        notes: '',
                        created_at: now,
                        updated_at: now
                    });
                }
            }
        });

        await queryInterface.bulkInsert('borrow_details', borrowDetails);

        // ===================================================================
        // 18. REMINDERS
        // ===================================================================
        const borrowedRequests = borrowRequestsData.filter(r => r.status === 'borrowed' || r.status === 'overdue');
        const reminders = borrowedRequests.slice(0, 3).map((request, idx) => ({
            borrow_request_id: request.id,
            sent_date: daysAgo(3 - idx), // 3, 2, 1 ngày trước
            content: 'Nhắc nhở trả sách đúng hạn. Vui lòng kiểm tra thời hạn và tránh phạt quá hạn.',
            estimated_fine: 0,
            created_at: now,
            updated_at: now
        }));
        await queryInterface.bulkInsert('reminders', reminders);

        console.log('✅ Seed data completed successfully!');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('reminders', null, {});
        await queryInterface.bulkDelete('fines', null, {});
        await queryInterface.bulkDelete('borrow_details', null, {});
        await queryInterface.bulkDelete('borrow_requests', null, {});
        await queryInterface.bulkDelete('book_copies', null, {});
        await queryInterface.bulkDelete('book_editions', null, {});
        await queryInterface.bulkDelete('book_authors', null, {});
        await queryInterface.bulkDelete('books', null, {});
        await queryInterface.bulkDelete('authors', null, {});
        await queryInterface.bulkDelete('publishers', null, {});
        await queryInterface.bulkDelete('genres', null, {});
        await queryInterface.bulkDelete('fields', null, {});
        await queryInterface.bulkDelete('system_settings', null, {});
        await queryInterface.bulkDelete('deposit_transactions', null, {});
        await queryInterface.bulkDelete('library_cards', null, {});
        await queryInterface.bulkDelete('readers', null, {});
        await queryInterface.bulkDelete('staffs', null, {});
        await queryInterface.bulkDelete('accounts', null, {});
        await queryInterface.bulkDelete('user_groups', null, {});
    }
};
