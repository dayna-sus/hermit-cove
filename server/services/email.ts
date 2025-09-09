// Email service for sending feedback to the creator
// In a production environment, this would use a service like SendGrid, Nodemailer, or similar

interface FeedbackEmail {
  message: string;
  timestamp: Date;
  userAgent?: string;
}

export async function sendFeedbackEmail({ message, timestamp, userAgent }: FeedbackEmail): Promise<void> {
  const creatorEmail = "dayna.aamodt@gmail.com"; // Hidden from frontend
  
  // For development: Log the email content that would be sent
  console.log('📧 Email would be sent to:', creatorEmail);
  console.log('📧 Subject: New Feedback for Hermit Cove');
  console.log('📧 Content:');
  console.log('----------------------------------------');
  console.log(`Feedback received: ${timestamp.toISOString()}`);
  console.log('');
  console.log('User Message:');
  console.log(message);
  console.log('');
  if (userAgent) {
    console.log(`User Agent: ${userAgent}`);
  }
  console.log('----------------------------------------');
  
  // TODO: In production, implement actual email sending using:
  // - SendGrid API
  // - Nodemailer with SMTP
  // - AWS SES
  // - Or another email service
  
  // For now, simulate successful email sending
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('✅ Feedback email logged successfully');
}

export function formatFeedbackForEmail(message: string, userAgent?: string): string {
  const timestamp = new Date().toISOString();
  
  return `
New Feedback for Hermit Cove
============================

Received: ${timestamp}

Message:
${message}

${userAgent ? `User Agent: ${userAgent}` : ''}

---
This feedback was submitted through the Hermit Cove app.
  `.trim();
}