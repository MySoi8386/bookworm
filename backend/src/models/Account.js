/**
 * ===================================================================
 * MODEL: TÀI KHOẢN (Account)
 * ===================================================================
 * Bảng lưu trữ thông tin đăng nhập của người dùng
 * - Mỗi tài khoản thuộc về một nhóm người dùng
 * - Tài khoản có thể là của Nhân viên hoặc Độc giả
 * ===================================================================
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const Account = sequelize.define('Account', {
        // Mã tài khoản - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã tài khoản'
        },

        // Mã nhóm người dùng - khóa ngoại
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã nhóm người dùng (FK -> user_groups)'
        },

        // Tên đăng nhập - duy nhất
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Tên đăng nhập'
        },

        // Mật khẩu - đã được mã hóa
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Mật khẩu (đã mã hóa bcrypt)'
        },

        // Email - duy nhất, dùng để khôi phục mật khẩu
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            },
            comment: 'Email liên hệ'
        },

        // Trạng thái tài khoản
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'locked'),
            defaultValue: 'active',
            comment: 'Trạng thái: active-hoạt động, inactive-chưa kích hoạt, locked-bị khóa'
        },

        // Token đặt lại mật khẩu
        reset_password_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Token đặt lại mật khẩu'
        },

        // Thời gian hết hạn token
        reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Thời gian hết hạn token đặt lại mật khẩu'
        },

        // Token xác nhận email
        email_verification_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Token xác nhận email'
        },

        // Thời gian hết hạn token xác nhận email
        email_verification_expires: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Thời gian hết hạn token xác nhận email'
        }
    }, {
        tableName: 'accounts',
        timestamps: true,
        comment: 'Bảng tài khoản đăng nhập',

        // Hooks để mã hóa mật khẩu trước khi lưu
        hooks: {
            beforeCreate: async (account) => {
                if (account.password) {
                    const salt = await bcrypt.genSalt(10);
                    account.password = await bcrypt.hash(account.password, salt);
                }
            },
            beforeUpdate: async (account) => {
                if (account.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    account.password = await bcrypt.hash(account.password, salt);
                }
            }
        }
    });

    // Instance method: So sánh mật khẩu
    Account.prototype.comparePassword = async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    };

    return Account;
};
