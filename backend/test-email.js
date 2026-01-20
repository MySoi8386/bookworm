/**
 * Quick email test script (Gmail SMTP via nodemailer)
 *
 * Usage:
 *   cd backend
 *   node test-email.js
 *   node test-email.js someone@example.com
 */
require('dotenv').config();

const { verifyEmailTransport, sendPasswordResetEmail } = require('./src/config/email.config');

async function main() {
  const to = process.argv[2] || 'miumy0212@gmail.com';

  const check = await verifyEmailTransport();
  if (!check?.ok) {
    if (check?.reason === 'missing_env') {
      console.error('❌ Missing EMAIL_USER/EMAIL_PASS in backend/.env. See backend/ENVIRONMENT.md');
      process.exitCode = 2;
      return;
    }
    console.error('❌ Email transport verify failed:', check?.error || check);
    process.exitCode = 3;
    return;
  }

  const resetLink = 'https://example.com/test-email';
  await sendPasswordResetEmail(to, resetLink);
  console.log('✅ Sent test email to:', to);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err?.message || err);
  process.exitCode = 1;
});

