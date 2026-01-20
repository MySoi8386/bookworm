/**
 * ===================================================================
 * MIDDLEWARE: PHÂN QUYỀN (Authorization)
 * ===================================================================
 * Middleware kiểm tra quyền truy cập dựa trên role
 * - admin: Quản trị viên - toàn quyền
 * - librarian: Thủ thư - quản lý sách, mượn trả
 * - reader: Độc giả - tra cứu, mượn sách
 * ===================================================================
 */

/**
 * Middleware kiểm tra role được phép truy cập
 * @param  {...string} allowedRoles - Danh sách role được phép
 * @returns {Function} Middleware function
 * 
 * Sử dụng: authorize('admin', 'librarian')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Kiểm tra đã authenticate chưa
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        const userRole = req.user.role;

        // Kiểm tra quyền
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện chức năng này'
            });
        }

        next();
    };
};

/**
 * Middleware chỉ cho phép Admin
 */
const adminOnly = authorize('admin');

/**
 * Middleware cho phép Admin và Thủ thư
 */
const staffOnly = authorize('admin', 'librarian');

/**
 * Middleware cho phép tất cả user đã đăng nhập
 */
const authenticated = authorize('admin', 'librarian', 'reader');

/**
 * Middleware kiểm tra user có quyền truy cập resource của chính mình
 * @param {string} paramName - Tên param chứa ID cần kiểm tra
 * @param {string} userField - Field trong req.user để so sánh
 */
const ownerOrAdmin = (paramName, userField = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        const resourceId = parseInt(req.params[paramName]);
        const userId = req.user[userField];
        const userRole = req.user.role;

        // Admin được truy cập mọi resource
        if (userRole === 'admin') {
            return next();
        }

        // Thủ thư được truy cập resource của reader
        if (userRole === 'librarian' && userField === 'reader') {
            return next();
        }

        // Kiểm tra owner
        if (resourceId === userId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập dữ liệu này'
        });
    };
};

module.exports = {
    authorize,
    adminOnly,
    staffOnly,
    authenticated,
    ownerOrAdmin
};
