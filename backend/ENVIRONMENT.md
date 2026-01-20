# Backend environment variables

Tạo file `.env` trong thư mục `backend/` (cùng cấp `server.js`) và cấu hình các biến dưới đây.

## Server

- `PORT`: mặc định `5000`
- `NODE_ENV`: `development` / `production`

## Database (MySQL)

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## Frontend URL (dùng để tạo link xác thực/reset)

- `FRONTEND_URL`: ví dụ `http://localhost:3000`

## Email (Gmail SMTP qua nodemailer)

- `EMAIL_USER`: địa chỉ Gmail dùng để gửi
- `EMAIL_PASS`: **App Password** của Gmail (không phải mật khẩu đăng nhập)
- `EMAIL_FROM` (tuỳ chọn): ví dụ `BookWorm Library <your@gmail.com>`

Ghi chú: với Gmail, thường bạn cần bật 2FA và tạo App Password để SMTP hoạt động.

