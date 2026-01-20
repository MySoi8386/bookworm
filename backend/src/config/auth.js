module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // System defaults
    defaultDepositAmount: parseInt(process.env.DEFAULT_DEPOSIT_AMOUNT) || 200000,
    defaultMaxBooks: parseInt(process.env.DEFAULT_MAX_BOOKS) || 5,
    defaultBorrowDays: parseInt(process.env.DEFAULT_BORROW_DAYS) || 14,
    fineRatePercent: parseInt(process.env.FINE_RATE_PERCENT) || 10
};
