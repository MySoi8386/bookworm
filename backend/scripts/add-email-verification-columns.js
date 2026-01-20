/**
 * ===================================================================
 * SCRIPT: Thêm email verification columns vào bảng accounts
 * ===================================================================
 * Chạy script này để thêm các cột:
 * - email_verification_token
 * - email_verification_expires
 * ===================================================================
 */

const { sequelize } = require('../src/models');

(async () => {
    try {
        console.log('🔄 Đang kết nối database...');
        await sequelize.authenticate();
        console.log('✅ Kết nối database thành công');

        // Kiểm tra xem cột đã tồn tại chưa
        const [results] = await sequelize.query(
            "SHOW COLUMNS FROM accounts LIKE 'email_verification_token'"
        );

        if (results.length === 0) {
            console.log('🔄 Đang thêm cột email_verification_token...');
            await sequelize.query(
                "ALTER TABLE accounts ADD COLUMN email_verification_token VARCHAR(255) NULL COMMENT 'Token xác nhận email'"
            );
            console.log('✅ Đã thêm cột email_verification_token');

            console.log('🔄 Đang thêm cột email_verification_expires...');
            await sequelize.query(
                "ALTER TABLE accounts ADD COLUMN email_verification_expires DATETIME NULL COMMENT 'Thời gian hết hạn token xác nhận email'"
            );
            console.log('✅ Đã thêm cột email_verification_expires');

            console.log('\n========================================');
            console.log('🎉 Hoàn thành! Đã thêm các cột email verification');
            console.log('========================================\n');
        } else {
            console.log('✅ Các cột email verification đã tồn tại');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error(error);
        await sequelize.close();
        process.exit(1);
    }
})();
