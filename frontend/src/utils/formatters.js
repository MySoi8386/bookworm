/**
 * ===================================================================
 * UTILITY FUNCTIONS - Các hàm tiện ích dùng chung
 * ===================================================================
 */

/**
 * Format số tiền thành chuỗi tiền tệ VND
 * @param {number} amount - Số tiền cần format
 * @returns {string} - Chuỗi tiền tệ đã format, ví dụ: "1,234,567 VNĐ"
 */
export const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('vi-VN') + ' VNĐ';
};

/**
 * Format ngày tháng theo định dạng Việt Nam
 * @param {string|Date} dateStr - Ngày cần format
 * @returns {string} - Chuỗi ngày đã format, ví dụ: "15/01/2026"
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

/**
 * Format ngày giờ đầy đủ theo định dạng Việt Nam
 * @param {string|Date} dateStr - Ngày giờ cần format
 * @returns {string} - Chuỗi ngày giờ đã format, ví dụ: "15/01/2026 09:30"
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime
};
