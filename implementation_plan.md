# Kế hoạch triển khai nhiều tính năng

## Tổng quan các tính năng

| # | Tính năng | Độ ưu tiên |
|---|-----------|------------|
| 1 | Thêm ngày thành lập NXB vào form | Thấp |
| 2 | Xóa page_count, size khỏi sách | Trung bình |
| 3 | Kiểm tra/bổ sung giá sách khi tạo | Cao |
| 4 | Sắp xếp lại Sidebar | Trung bình |
| 5 | Logic mất sách → thanh lý | Cao |
| 6 | Logic hư hỏng, thanh lý | Cao |
| 7 | Chọn bản sách cụ thể để bớt | Trung bình |
| 8 | Đổi "Tìm sách" → "Tủ sách" | Thấp |
| 9 | 1 phiếu = 1 sách | Cao |
| 10 | Nút mượn sách trong popup tủ sách | Cao |
| 11 | 1 quyển chỉ mượn 1 NXB | Cao |
| 12 | Bổ sung trang Tài chính cho thủ thư | Trung bình |
| 13 | Xóa gia hạn phiếu mượn | Đã xong ✅ |
| 14 | Xóa biểu đồ "Xu hướng mượn sách" | Thấp |

---

## 1. Thêm ngày thành lập NXB vào form

### Trạng thái: ✅ Đã có sẵn

**Đã có:**
- Model: `Publisher.js` dòng 38-42 có trường `established_date`
- Frontend: `EditionFormModal.jsx` dòng 222-223 có input ngày thành lập khi tạo NXB mới

**Không cần thay đổi.**

---

## 2. Xóa page_count và size khỏi sách

### Files cần sửa:

#### Backend

##### [MODIFY] [Book.js](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/backend/src/models/Book.js)
- Xóa trường `page_count` (dòng 53-58)
- Xóa trường `size` (dòng 60-65)

##### [NEW] Migration: remove_page_count_size.js
```javascript
// migrations/xxxxxx-remove-page-count-size.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('books', 'page_count');
        await queryInterface.removeColumn('books', 'size');
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('books', 'page_count', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('books', 'size', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
    }
};
```

#### Frontend

##### [MODIFY] [BookFormModal.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/books/BookFormModal.jsx)
- Xóa `page_count` và `size` khỏi formData (dòng 24, 58, 66, 143)
- Xóa input fields cho page_count và size (dòng 248-272)

##### [MODIFY] [BookDetailModal.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/books/BookDetailModal.jsx)
- Xóa hiển thị page_count (dòng 134-139)
- Xóa hiển thị size nếu có

##### [MODIFY] bookService.js
- Cập nhật JSDoc comments (dòng 45, 55) bỏ page_count, size

---

## 3. Kiểm tra/Bổ sung giá sách khi tạo

### Phân tích hiện tại:
- `BookCopy.js` có trường `price` (dòng 38-44)
- **Vấn đề:** Khi tạo bản sách, không có UI nhập giá

### Files cần sửa:

#### Frontend

##### [MODIFY] [BookDetailModal.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/books/BookDetailModal.jsx)
Khi thêm bản sách mới, cần có input nhập giá:

```jsx
// Trong phần thêm bản sách
<div>
    <label>Giá sách (VNĐ) *</label>
    <input type="number" name="price" min="0" step="1000" required />
</div>
```

##### [MODIFY] Backend: book.controller.js
Đảm bảo API `addCopies` nhận và lưu `price`:
```javascript
// Khi tạo copy
const { count, price } = req.body;
// Validate price
if (!price || price <= 0) {
    throw new AppError('Giá sách phải lớn hơn 0', 400);
}
```

---

## 4. Sắp xếp lại Sidebar

### Menu Admin/Thủ thư (Thứ tự mới):

```javascript
const staffMenuItems = [
    // Nhóm 1: Chính
    { path: '/dashboard', icon: HiOutlineHome, label: 'Trang chủ' },
    { path: '/borrow', icon: HiOutlineBookOpen, label: 'Mượn' },
    { path: '/return', icon: HiOutlineBookOpen, label: 'Trả' },
    { path: '/members', icon: HiOutlineUserGroup, label: 'Thành viên' },
    { path: '/notifications', icon: HiOutlineBell, label: 'Thông báo' },
    // Nhóm 2: Quản lý sách
    { path: '/books', icon: HiOutlineCollection, label: 'Sách' },
    { path: '/categories', icon: HiOutlineTag, label: 'Danh mục' },
    // Nhóm 3: Báo cáo
    { path: '/finance', icon: HiOutlineCurrencyDollar, label: 'Tài chính' },
    { path: '/statistics', icon: HiOutlineChartBar, label: 'Báo cáo' },
    // Nhóm 4: Cá nhân
    { path: '/profile', icon: HiOutlineUser, label: 'Hồ sơ' },
];

const adminOnlyItems = [
    { path: '/operations', icon: HiOutlineOfficeBuilding, label: 'Điều hành' },
    { path: '/settings', icon: HiOutlineCog, label: 'Cài đặt' },
];
```

### Menu Độc giả (Thứ tự mới):

```javascript
const readerMenuItems = [
    { path: '/dashboard', icon: HiOutlineHome, label: 'Trang chủ' },
    { path: '/search', icon: HiOutlineCollection, label: 'Tủ sách' }, // Đổi tên từ "Tìm sách"
    { path: '/my-books', icon: HiOutlineBookOpen, label: 'Phiếu mượn' },
    { path: '/my-finance', icon: HiOutlineCurrencyDollar, label: 'Công nợ' },
    { path: '/profile', icon: HiOutlineUser, label: 'Hồ sơ' },
];
```

#### [MODIFY] [Sidebar.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/layout/Sidebar.jsx)
- Thay đổi thứ tự `staffMenuItems` theo danh sách trên
- Thay đổi `readerMenuItems` theo danh sách trên

---

## 5. Logic mất sách → Thanh lý

### Yêu cầu:
- Khi đánh dấu sách bị mất (lost) → Chuyển status thành `disposed`
- KHÔNG xóa bản sách, chỉ chuyển trạng thái
- Sách mất sẽ nằm trong danh sách "thanh lý"

### Files cần sửa:

#### Backend

##### [MODIFY] [book.controller.js](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/backend/src/controllers/book.controller.js)

```javascript
/**
 * Đánh dấu sách bị mất
 * Khi mất sách: cập nhật status = 'disposed' + ghi chú
 */
const markBookAsLost = asyncHandler(async (req, res) => {
    const { copy_id, notes } = req.body;
    
    const copy = await BookCopy.findByPk(copy_id);
    if (!copy) throw new AppError('Không tìm thấy bản sách', 404);
    
    await copy.update({
        status: 'disposed',
        condition_notes: `[MẤT SÁCH] ${notes || 'Được đánh dấu mất bởi thủ thư'}`
    });
    
    res.json({ success: true, message: 'Đã đánh dấu sách bị mất' });
});
```

##### [MODIFY] [ReturnBookCollapse.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/Borrowing/ReturnBookCollapse.jsx)
- Khi chọn "Mất sách" trong dropdown condition
- Gọi API cập nhật status → disposed

---

## 6. Logic hư hỏng và thanh lý

### Yêu cầu:
- **Hư hỏng (damaged):** Sách hỏng nhưng vẫn có thể sử dụng → giữ status `damaged`
- **Thanh lý (disposed):** Sách không thể sử dụng nữa → status `disposed`

### Files cần sửa:

#### Backend

##### [MODIFY] book.controller.js
```javascript
/**
 * Cập nhật tình trạng sách
 */
const updateBookCopyCondition = asyncHandler(async (req, res) => {
    const { copy_id, status, notes } = req.body;
    
    // Validate status
    if (!['available', 'damaged', 'disposed'].includes(status)) {
        throw new AppError('Trạng thái không hợp lệ', 400);
    }
    
    // Không cho đổi status nếu đang borrowed
    const copy = await BookCopy.findByPk(copy_id);
    if (copy.status === 'borrowed') {
        throw new AppError('Không thể thay đổi trạng thái sách đang được mượn', 400);
    }
    
    await copy.update({ status, condition_notes: notes });
    
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
});
```

#### Frontend

##### [NEW] UI quản lý tình trạng sách
Trong `BookDetailModal.jsx`, thêm dropdown để đổi trạng thái bản sách:
- Available (Có sẵn)
- Damaged (Hư hỏng)
- Disposed (Thanh lý)

---

## 7. Chọn bản sách cụ thể để bớt

### Yêu cầu:
- Thay vì bớt từ trên xuống, cho phép chọn bản cụ thể để xóa/thanh lý

### Files cần sửa:

#### Frontend

##### [MODIFY] BookDetailModal.jsx
Trong phần hiển thị danh sách bản sách:
```jsx
// Thêm checkbox hoặc nút "Bớt" cho từng bản sách
{copies.map(copy => (
    <div key={copy.id} className="flex items-center justify-between">
        <span>Bản #{copy.copy_number}</span>
        <span>{copy.status}</span>
        {copy.status === 'available' && (
            <button onClick={() => handleRemoveCopy(copy.id)}>
                Bớt bản này
            </button>
        )}
    </div>
))}
```

#### Backend

##### [MODIFY] book.controller.js
```javascript
/**
 * Bớt bản sách cụ thể
 * @route DELETE /api/editions/:id/copies/:copyId
 */
const removeSpecificCopy = asyncHandler(async (req, res) => {
    const { copyId } = req.params;
    
    const copy = await BookCopy.findByPk(copyId);
    if (!copy) throw new AppError('Không tìm thấy bản sách', 404);
    
    if (copy.status === 'borrowed') {
        throw new AppError('Không thể bớt sách đang được mượn', 400);
    }
    
    // Thay vì xóa, chuyển sang trạng thái thanh lý
    await copy.update({ 
        status: 'disposed',
        condition_notes: 'Bị bớt khỏi kho'
    });
    
    res.json({ success: true, message: 'Đã bớt bản sách' });
});
```

---

## 8. Đổi "Tìm sách" → "Tủ sách"

#### [MODIFY] [Sidebar.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/components/layout/Sidebar.jsx)
Dòng 129: `label: 'Tìm sách'` → `label: 'Tủ sách'`

---

## 9. ⚠️ 1 phiếu = 1 sách

### Đây là thay đổi lớn, ảnh hưởng nhiều file

### Backend

##### [MODIFY] borrow.controller.js
```javascript
// Khi tạo phiếu mượn, chỉ cho phép 1 sách
const createBorrowRequest = asyncHandler(async (req, res) => {
    const { book_copy_id } = req.body; // Chỉ nhận 1 copy_id, không phải array
    
    if (!book_copy_id) {
        throw new AppError('Vui lòng chọn sách cần mượn', 400);
    }
    
    // ... logic tạo phiếu với 1 sách
});
```

##### [MODIFY] BorrowRequest model validation
Thêm constraint: mỗi phiếu chỉ có 1 BorrowDetail

### Frontend

##### [MODIFY] CreateBorrowModal.jsx
- Xóa logic chọn nhiều sách
- Chỉ cho chọn 1 sách

##### [MODIFY] BorrowPage.jsx, ReturnPage.jsx
- Cập nhật hiển thị phù hợp (không cần danh sách sách, chỉ 1 sách)

---

## 10. Nút "Mượn sách" trong popup tủ sách (độc giả)

### Files cần sửa:

#### Frontend

##### [MODIFY] Trang tủ sách của độc giả
Tìm file hiển thị popup chi tiết sách cho độc giả, thêm:
```jsx
<button 
    onClick={() => handleBorrowBook(book)}
    className="bg-black text-white px-4 py-2 rounded"
>
    Mượn sách này
</button>

const handleBorrowBook = async (book) => {
    // Tạo phiếu mượn với status = 'pending'
    await api.post('/borrow-requests', {
        book_copy_id: selectedCopyId
    });
    toast.success('Đã gửi yêu cầu mượn sách');
};
```

---

## 11. 1 quyển chỉ được mượn từ 1 NXB

### Giải thích:
- Mỗi đầu sách (Book) có thể có nhiều phiên bản (BookEdition) từ các NXB khác nhau
- Yêu cầu: Khi độc giả mượn 1 đầu sách, chỉ được chọn 1 NXB (1 edition)

### Backend

##### [MODIFY] Validation trong borrow.controller.js
```javascript
// Kiểm tra xem reader đã mượn sách này từ NXB khác chưa
const existingBorrow = await BorrowRequest.findOne({
    where: {
        library_card_id: card.id,
        status: { [Op.in]: ['pending', 'approved', 'borrowed'] }
    },
    include: [{
        model: BorrowDetail,
        as: 'details',
        include: [{
            model: BookCopy,
            include: [{
                model: BookEdition,
                where: { book_id: selectedCopy.bookEdition.book_id }
            }]
        }]
    }]
});

if (existingBorrow) {
    throw new AppError('Bạn đã mượn/đang chờ duyệt sách này. Không thể mượn thêm.', 400);
}
```

---

## 12. Bổ sung trang Tài chính cho Thủ thư

### Hiện tại:
- `/finance` có trong `staffMenuItems` nhưng cần kiểm tra xem:
  - Thủ thư (librarian) có access không
  - Nội dung trang có phù hợp với quyền thủ thư không

### Files cần kiểm tra:

##### [CHECK] App.jsx hoặc routes
Đảm bảo route `/finance` cho phép cả `admin` và `librarian`

##### [CHECK] FinancePage.jsx
Đảm bảo thủ thư có thể xem được các thông tin cần thiết

---

## 13. Xóa gia hạn phiếu mượn

### Trạng thái: ✅ Đã xong

Tìm kiếm không thấy "gia hạn" hay "extend" trong code frontend.

---

## 14. Xóa biểu đồ "Xu hướng mượn sách"

#### [MODIFY] [StatisticsPage.jsx](file:///D:/Self%20learning/CODE%20WEB/CodeThue/HaMy_14_01_2026/frontend/src/pages/statistics/StatisticsPage.jsx)
- Tìm và xóa section chứa "Xu hướng mượn sách" (khoảng dòng 287)

---

## Verification Plan

### Automated Tests
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

### Manual Testing Checklist

- [ ] **Sidebar:** Kiểm tra thứ tự menu đúng cho admin, thủ thư, độc giả
- [ ] **Sách:** Không còn page_count, size khi thêm/sửa/xem
- [ ] **Giá sách:** Có thể nhập giá khi thêm bản sách
- [ ] **Mất sách:** Đánh dấu mất → chuyển status disposed
- [ ] **Bớt bản:** Có thể chọn bản cụ thể để bớt
- [ ] **1 phiếu 1 sách:** Không thể chọn nhiều sách trong 1 phiếu
- [ ] **Mượn sách:** Độc giả click "Mượn" trong popup → tạo phiếu pending
- [ ] **Thống kê:** Không còn biểu đồ "Xu hướng mượn sách"
- [ ] **Tài chính:** Thủ thư truy cập được trang tài chính
