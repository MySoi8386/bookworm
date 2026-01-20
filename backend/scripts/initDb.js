/**
 * ===================================================================
 * SCRIPT: KHỞI TẠO DATABASE
 * ===================================================================
 * Chạy script này để tạo database và các bảng
 * Usage: node scripts/initDb.js
 * ===================================================================
 */

require('dotenv').config();
const { sequelize } = require('../src/models');

const initDatabase = async () => {
    try {
        console.log('🔄 Connecting to database...');

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established.');

        // Sync all models (create tables)
        console.log('🔄 Creating tables...');
        await sequelize.sync({ force: true }); // force: true sẽ DROP và tạo lại bảng
        console.log('✅ All tables created successfully.');

        // Run seeder
        console.log('🔄 Seeding initial data...');
        const seeder = require('../seeders/20240114000001-initial-data');
        await seeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log('✅ Initial data seeded successfully.');

        console.log('\n========================================');
        console.log('🎉 Database initialized successfully!');
        console.log('========================================');
        console.log('\nDefault accounts:');
        console.log('  Admin:     admin / admin123');
        console.log('  Librarian: librarian / admin123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initDatabase();
