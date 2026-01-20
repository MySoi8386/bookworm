/**
 * ===================================================================
 * EMAIL CONFIG - Cấu hình gửi email
 * ===================================================================
 * Sử dụng Gmail SMTP với nodemailer
 * ===================================================================
 */

const nodemailer = require('nodemailer');

const hasEmailEnv = () => {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

// Tạo transporter với Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Cảnh báo sớm nếu chưa cấu hình email (tránh "không thấy gửi mail" nhưng không biết vì sao)
if (!hasEmailEnv()) {
    // eslint-disable-next-line no-console
    console.warn('[email] Missing EMAIL_USER/EMAIL_PASS. Email sending will be skipped/fail. See backend/ENVIRONMENT.md');
}

/**
 * Verify cấu hình SMTP (dùng để debug)
 */
const verifyEmailTransport = async () => {
    if (!hasEmailEnv()) return { ok: false, reason: 'missing_env' };
    try {
        await transporter.verify();
        return { ok: true };
    } catch (err) {
        return { ok: false, reason: 'verify_failed', error: err?.message || String(err) };
    }
};

/**
 * Gửi email đặt lại mật khẩu
 * @param {string} to - Email người nhận
 * @param {string} resetLink - Link đặt lại mật khẩu
 */
const sendPasswordResetEmail = async (to, resetLink) => {
    if (!hasEmailEnv()) return null;
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Yêu cầu đặt lại mật khẩu - BookWorm Library',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">BookWorm Library</h1>
                    <p style="color: #666; margin: 5px 0;">Hệ thống quản lý thư viện</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #333; margin-top: 0;">Xin chào,</h2>
                    <p style="color: #555; line-height: 1.6;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    </p>
                    <p style="color: #555; line-height: 1.6;">
                        Nhấn vào nút bên dưới để đặt lại mật khẩu:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background: #333; color: #fff; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;
                                  font-weight: bold;">
                            Đặt lại mật khẩu
                        </a>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; font-size: 14px;">
                        Hoặc copy và dán link sau vào trình duyệt:<br>
                        <a href="${resetLink}" style="color: #0066cc; word-break: break-all;">${resetLink}</a>
                    </p>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 20px;">
                        Link này sẽ hết hạn sau 1 giờ.<br>
                        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2024 BookWorm Library. All rights reserved.</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Gửi email thông báo sách quá hạn
 * @param {string} to - Email người nhận
 * @param {string} readerName - Tên độc giả
 * @param {Array} overdueBooks - Danh sách sách quá hạn
 * @param {string} customMessage - Nội dung thông báo tùy chỉnh
 */
const sendOverdueNotificationEmail = async (to, readerName, overdueBooks, customMessage) => {
    if (!hasEmailEnv()) return null;
    // Tạo danh sách sách quá hạn
    let bookListHtml = '';
    if (overdueBooks && overdueBooks.length > 0) {
        bookListHtml = `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #333; color: #fff;">
                        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Tên sách</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Ngày hẹn trả</th>
                        <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Số ngày quá hạn</th>
                    </tr>
                </thead>
                <tbody>
                    ${overdueBooks.map(book => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${book.title}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${book.dueDate}</td>
                            <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: #e53935;">${book.daysOverdue} ngày</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Thông báo sách quá hạn - BookWorm Library',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">BookWorm Library</h1>
                    <p style="color: #666; margin: 5px 0;">Hệ thống quản lý thư viện</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #333; margin-top: 0;">Xin chào ${readerName},</h2>
                    
                    <div style="color: #555; line-height: 1.6; white-space: pre-line;">
                        ${customMessage}
                    </div>
                    
                    ${bookListHtml}
                    
                    <p style="color: #555; line-height: 1.6;">
                        Vui lòng đến thư viện để trả sách sớm nhất có thể để tránh phát sinh thêm tiền phạt.
                    </p>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 20px;">
                        Nếu bạn đã trả sách, vui lòng bỏ qua email này.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2024 BookWorm Library. All rights reserved.</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Gửi email chào mừng khi đăng ký tài khoản thành công
 * @param {string} to - Email người nhận
 * @param {string} readerName - Tên độc giả
 * @param {string} username - Tên đăng nhập
 * @param {string} verificationLink - Link xác nhận email
 */
const sendWelcomeEmail = async (to, readerName, username, verificationLink) => {
    if (!hasEmailEnv()) return null;
    // Đảm bảo luôn dùng port 3000
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Nếu FRONTEND_URL có port 5173, thay thế bằng 3000
    if (frontendUrl.includes(':5173')) {
        frontendUrl = frontendUrl.replace(':5173', ':3000');
    }
    const loginLink = `${frontendUrl}/login`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: 'Chào mừng đến với BookWorm Library!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">BookWorm Library</h1>
                    <p style="color: #666; margin: 5px 0;">Hệ thống quản lý thư viện</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #333; margin-top: 0;">Xin chào ${readerName},</h2>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Chúc mừng bạn đã đăng ký tài khoản thành công tại BookWorm Library!
                    </p>
                    
                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #333;">
                        <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Thông tin tài khoản của bạn:</p>
                        <p style="color: #555; margin: 5px 0;"><strong>Tên đăng nhập:</strong> ${username}</p>
                        <p style="color: #555; margin: 5px 0;"><strong>Email:</strong> ${to}</p>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Để kích hoạt tài khoản và bắt đầu sử dụng các dịch vụ của thư viện, vui lòng xác nhận email của bạn bằng cách nhấn vào nút bên dưới:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background: #333; color: #fff; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;
                                  font-weight: bold;">
                            Xác nhận email
                        </a>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; font-size: 14px;">
                        Hoặc copy và dán link sau vào trình duyệt:<br>
                        <a href="${verificationLink}" style="color: #0066cc; word-break: break-all;">${verificationLink}</a>
                    </p>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 20px;">
                        Link này sẽ hết hạn sau 24 giờ.<br>
                        Sau khi xác nhận email, bạn có thể đăng nhập tại: <a href="${loginLink}" style="color: #0066cc;">${loginLink}</a>
                    </p>
                    
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #1976d2; margin: 0; font-weight: bold; margin-bottom: 10px;">📚 Các dịch vụ bạn có thể sử dụng:</p>
                        <ul style="color: #555; margin: 0; padding-left: 20px;">
                            <li>Tìm kiếm và mượn sách trực tuyến</li>
                            <li>Xem lịch sử mượn trả sách</li>
                            <li>Thanh toán tiền phạt trực tuyến</li>
                            <li>Nhận thông báo về sách quá hạn</li>
                        </ul>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6;">
                        Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc đến trực tiếp thư viện.
                    </p>
                    
                    <p style="color: #888; font-size: 13px; margin-top: 20px;">
                        Trân trọng,<br>
                        Đội ngũ BookWorm Library
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                    <p>© 2024 BookWorm Library. All rights reserved.</p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    transporter,
    verifyEmailTransport,
    sendPasswordResetEmail,
    sendOverdueNotificationEmail,
    sendWelcomeEmail
};
