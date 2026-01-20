# Library Management System

Hệ thống quản lý thư viện với Node.js, React, MySQL.

## Cấu trúc dự án

```
HaMy_14_01_2026/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Cấu hình database, JWT
│   │   ├── controllers/  # Xử lý logic API
│   │   ├── middlewares/  # Auth, validation, error handling
│   │   ├── models/       # Sequelize models (19 models)
│   │   ├── routes/       # API routes
│   │   └── validators/   # Input validation
│   ├── seeders/          # Dữ liệu mẫu
│   ├── migrations/       # Database migrations
│   ├── scripts/          # Scripts tiện ích
│   ├── .env              # Cấu hình môi trường
│   └── server.js
│
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── components/   # UI Components
        ├── pages/        # Page components
        ├── services/     # API services
        └── contexts/     # React contexts
```

## Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

## Cài đặt Backend

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình database

Tạo database MySQL:
```sql
CREATE DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chỉnh sửa file `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=library_management
DB_USER=root
DB_PASSWORD=your_password
```

### 3. Khởi tạo database

```bash
# Cách 1: Dùng script tự động (khuyến nghị)
node scripts/initDb.js

# Cách 2: Chạy thủ công từng bước
npx sequelize-cli db:migrate    # Chạy migrations
npx sequelize-cli db:seed:all   # Chạy seed data
```

### 4. Reset database (nếu cần)

```bash
# Xóa toàn bộ data và chạy lại seed
npx sequelize-cli db:seed:undo:all
npx sequelize-cli db:seed:all

# Hoặc reset hoàn toàn (kể cả schema)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Chạy server

```bash
# Development mode (với hot reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: http://localhost:5000

## Cài đặt Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## Tài khoản mặc định

### Admin & Thủ thư
| Username   | Password   | Role       |
|------------|------------|------------|
| admin      | admin123   | Admin      |
| librarian  | admin123   | Thủ thư    |

### Độc giả
| Username   | Password   | Role    | Thẻ TV      |
|------------|------------|---------|-------------|
| reader001  | reader123  | Độc giả | TV2024001   |
| reader002  | reader123  | Độc giả | TV2024002   |
| reader003  | reader123  | Độc giả | TV2024003   |
| reader004  | reader123  | Độc giả | TV2024004   |
| reader005  | reader123  | Độc giả | TV2024005   |
| reader006  | reader123  | Độc giả | TV2024006   |
| reader007  | reader123  | Độc giả | TV2024007   |
| reader008  | reader123  | Độc giả | TV2024008   |

## Dữ liệu mẫu (Seed Data)

Seed file: `backend/seeders/20240114000001-initial-data.js`

### Dữ liệu bao gồm:
- **User Groups:** 3 nhóm (admin, librarian, reader)
- **Accounts:** 2 staff + 8 readers = 10 tài khoản
- **Publishers:** 8 NXB (có ngày thành lập)
- **Authors:** 10 tác giả
- **Fields:** 6 lĩnh vực
- **Genres:** 6 thể loại
- **Books:** 15 đầu sách (KHÔNG có page_count, size)
- **Book Editions:** 16 phiên bản xuất bản
- **Book Copies:** ~60 bản sách (có giá tiền)
- **Library Cards:** 8 thẻ thư viện
- **Borrow Requests:** 8 phiếu mượn (1 phiếu = 1 sách)
- **Fines:** Phạt mẫu cho phiếu quá hạn

### Logic đặc biệt trong seed:
- ✅ **1 phiếu = 1 sách:** Mỗi BorrowRequest chỉ có 1 BorrowDetail
- ✅ **Không có page_count, size:** Đã xóa khỏi model Book
- ✅ **Giá sách bắt buộc:** Mỗi BookCopy đều có price > 0
- ✅ **Ngày thành lập NXB:** Publishers có established_date

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký độc giả
- `GET /api/auth/me` - Thông tin user hiện tại
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Danh mục
- `GET/POST /api/fields` - Lĩnh vực
- `GET/POST /api/genres` - Thể loại
- `GET/POST /api/authors` - Tác giả
- `GET/POST /api/publishers` - Nhà xuất bản

### Sách
- `GET/POST /api/books` - Đầu sách
- `GET/POST /api/books/:id/editions` - Phiên bản
- `GET/POST /api/editions/:id/copies` - Bản sách

### Độc giả
- `GET/POST /api/readers` - Độc giả
- `POST /api/library-cards` - Cấp thẻ thư viện

### Mượn trả
- `GET/POST /api/borrow-requests` - Phiếu mượn
- `PUT /api/borrow-requests/:id/approve` - Duyệt
- `PUT /api/borrow-requests/:id/return` - Trả sách

### Tài chính
- `GET /api/fines` - Tiền phạt
- `GET /api/deposits` - Tiền cọc

### Thống kê
- `GET /api/statistics/dashboard` - Tổng quan
- `GET /api/statistics/overdue` - Sách quá hạn
- `GET /api/reports/semi-annual` - Báo cáo 6 tháng

## Phân quyền

| Chức năng | Admin | Thủ thư | Độc giả |
|-----------|-------|---------|---------|
| Quản lý nhân viên | ✅ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ |
| Thêm/Sửa danh mục | ✅ | ✅ | ❌ |
| Xóa danh mục | ✅ | ❌ | ❌ |
| Quản lý sách | ✅ | ✅ | ❌ |
| Thanh lý sách | ✅ | ❌ | ❌ |
| Quản lý độc giả | ✅ | ✅ | ❌ |
| Khóa tài khoản | ✅ | ✅ | ❌ |
| Duyệt phiếu mượn | ✅ | ✅ | ❌ |
| Tạo phiếu mượn | ✅ | ✅ | ⚠️ (chờ duyệt) |
| Thu tiền phạt/cọc | ✅ | ✅ | ❌ |
| Xem thống kê | ✅ | ✅ | ❌ |
| Xem tài chính | ✅ | ✅ | ❌ |

## Quy tắc nghiệp vụ

### Mượn sách
- **1 phiếu = 1 sách:** Mỗi phiếu mượn chỉ được chọn 1 cuốn sách
- **1 quyển = 1 NXB:** Không thể mượn cùng đầu sách từ NXB khác khi đang mượn
- **Không gia hạn:** Tính năng gia hạn phiếu mượn đã được tắt

### Trả sách & Phạt
- **Bình thường:** Sách trả về trạng thái `available`
- **Hư hỏng:** Sách về `damaged` + phạt 50% giá sách
- **Mất sách:** Sách về `disposed` (thanh lý) + phạt 100% giá sách
- **Quá hạn:** Phạt = Giá sách × 10% × Số ngày quá hạn

### Tài khoản
- Không cho phép xóa tài khoản, chỉ có thể khóa

## License

MIT
