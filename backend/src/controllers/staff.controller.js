const { Staff, Account, UserGroup, sequelize } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

/**
 * @desc    Get all staff
 * @route   GET /api/staff
 * @access  Admin only
 */
const getAllStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findAll({
        include: [
            {
                model: Account,
                as: 'account',
                attributes: ['id', 'username', 'email', 'status'],
                include: [
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'name']
                    }
                ]
            }
        ],
        order: [['id', 'DESC']]
    });

    res.json({
        success: true,
        data: staff
    });
});

/**
 * @desc    Create new staff
 * @route   POST /api/staff
 * @access  Admin only
 */
const createStaff = asyncHandler(async (req, res) => {
    const {
        username,
        password,
        email,
        full_name,
        position,
        phone,
        address,
        role // 'admin' or 'librarian'
    } = req.body;

    // Validate role
    if (!['admin', 'librarian'].includes(role)) {
        throw new AppError('Chức vụ không hợp lệ (phải là admin hoặc librarian)', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Check username existence
        const existingAccount = await Account.findOne({ where: { username } });
        if (existingAccount) {
            throw new AppError('Tên đăng nhập đã tồn tại', 400);
        }

        // Get group ID
        const group = await UserGroup.findOne({ where: { name: role } });
        if (!group) {
            throw new AppError('Nhóm người dùng không tồn tại', 400);
        }

        // Create Account
        const account = await Account.create({
            username,
            password,
            email,
            group_id: group.id,
            status: 'active'
        }, { transaction });

        // Create Staff
        const staff = await Staff.create({
            account_id: account.id,
            full_name,
            position: position || (role === 'admin' ? 'Quản trị viên' : 'Thủ thư'),
            phone,
            address
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Tạo nhân viên thành công',
            data: {
                ...staff.toJSON(),
                account: {
                    username: account.username,
                    email: account.email,
                    role: role
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Update staff
 * @route   PUT /api/staff/:id
 * @access  Admin only
 */
const updateStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { full_name, phone, address, position, status, password, role } = req.body;

    const staff = await Staff.findByPk(id, {
        include: [{ model: Account, as: 'account' }]
    });

    if (!staff) {
        throw new AppError('Không tìm thấy nhân viên', 404);
    }

    const transaction = await sequelize.transaction();

    try {
        // Update staff info
        await staff.update({
            full_name,
            phone,
            address,
            position
        }, { transaction });

        // Update account info if provided
        if (staff.account) {
            const updateData = {};
            if (status) updateData.status = status;
            if (password) updateData.password = password;

            // If changing role
            if (role && ['admin', 'librarian'].includes(role)) {
                const group = await UserGroup.findOne({ where: { name: role } });
                if (group) {
                    updateData.group_id = group.id;
                }
            }

            if (Object.keys(updateData).length > 0) {
                await staff.account.update(updateData, { transaction });
            }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Delete staff/Lock account
 * @route   DELETE /api/staff/:id
 * @access  Admin only
 */
const deleteStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const staff = await Staff.findByPk(id, {
        include: [{ model: Account, as: 'account' }]
    });

    if (!staff) {
        throw new AppError('Không tìm thấy nhân viên', 404);
    }

    // Prevent deleting self (conceptually handled by frontend, but good to have)
    if (staff.account.id === req.user.id) {
        throw new AppError('Không thể tự xóa tài khoản của mình', 400);
    }

    // Instead of hard delete, we lock the account
    if (staff.account) {
        await staff.account.update({ status: 'locked' });
    }

    res.json({
        success: true,
        message: 'Đã khóa tài khoản nhân viên'
    });
});

module.exports = {
    getAllStaff,
    createStaff,
    updateStaff,
    deleteStaff
};
