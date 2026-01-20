/**
 * ===================================================================
 * SCRIPT: Kiểm tra và sửa FRONTEND_URL trong .env
 * ===================================================================
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envPath = path.join(__dirname, '..', '.env');

console.log('🔍 Kiểm tra FRONTEND_URL trong .env...\n');

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    let found = false;
    const newLines = lines.map(line => {
        if (line.trim().startsWith('FRONTEND_URL=')) {
            found = true;
            const currentValue = line.split('=')[1]?.trim();
            console.log(`📌 Tìm thấy FRONTEND_URL: ${currentValue}`);
            
            if (currentValue && currentValue.includes('5173')) {
                console.log('⚠️  Port hiện tại là 5173, cần sửa thành 3000');
                return 'FRONTEND_URL=http://localhost:3000';
            } else if (!currentValue || currentValue === '') {
                console.log('⚠️  FRONTEND_URL chưa được set, sẽ thêm mặc định');
                return 'FRONTEND_URL=http://localhost:3000';
            } else {
                console.log('✅ FRONTEND_URL đã đúng');
                return line;
            }
        }
        return line;
    });
    
    if (!found) {
        console.log('⚠️  Không tìm thấy FRONTEND_URL, sẽ thêm vào cuối file');
        newLines.push('FRONTEND_URL=http://localhost:3000');
    }
    
    // Ghi lại file
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('\n✅ Đã cập nhật file .env');
    console.log('📝 FRONTEND_URL=http://localhost:3000');
    console.log('\n💡 Vui lòng restart server backend để áp dụng thay đổi!');
} else {
    console.log('❌ File .env không tồn tại');
    console.log('📝 Tạo file .env mới với FRONTEND_URL=http://localhost:3000');
    fs.writeFileSync(envPath, 'FRONTEND_URL=http://localhost:3000\n', 'utf8');
    console.log('✅ Đã tạo file .env');
}
