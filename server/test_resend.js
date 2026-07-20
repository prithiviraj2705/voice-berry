require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'YOUR_VERIFIED_EMAIL_HERE@example.com', // Replace with your email!
      subject: 'Test Email - Ulacab',
      html: '<p>This is a test email to verify Resend configuration is working.</p>',
    });
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
testEmail();
