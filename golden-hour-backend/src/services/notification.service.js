let twilioClient = null;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 10) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('Twilio initialization failed, fallback to mock notifications:', err.message);
  }
}

/**
 * Dispatches an SMS message.
 * @param {string} to - Recipient phone number
 * @param {string} body - SMS content
 */
const sendSms = async (to, body) => {
  if (twilioClient && fromNumber) {
    try {
      const response = await twilioClient.messages.create({
        body,
        from: fromNumber,
        to
      });
      console.log(`[Twilio SMS] Sent to ${to} (SID: ${response.sid})`);
      return { success: true, sid: response.sid };
    } catch (error) {
      console.error(`[Twilio SMS Error] Failed to send SMS to ${to}:`, error.message);
      // Fallback
    }
  }

  // Fallback / Mock behavior for local development
  console.log(`\n================== [MOCK SMS DISPATCH] ==================`);
  console.log(`To:   ${to}`);
  console.log(`Body: ${body}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`=========================================================\n`);
  return { success: true, mock: true };
};

/**
 * Triggers an automated emergency voice call with text-to-speech.
 * @param {string} to - Recipient phone number
 * @param {string} message - Text-to-speech message
 */
const triggerEmergencyCall = async (to, message) => {
  if (twilioClient && fromNumber) {
    try {
      const response = await twilioClient.calls.create({
        twiml: `<Response><Say voice="alice">${message}</Say></Response>`,
        to,
        from: fromNumber
      });
      console.log(`[Twilio Call] Call initiated to ${to} (SID: ${response.sid})`);
      return { success: true, sid: response.sid };
    } catch (error) {
      console.error(`[Twilio Call Error] Failed to call ${to}:`, error.message);
    }
  }

  // Fallback / Mock behavior for local development
  console.log(`\n================== [MOCK VOICE CALL] ==================`);
  console.log(`To:      ${to}`);
  console.log(`Message: "${message}"`);
  console.log(`Time:    ${new Date().toISOString()}`);
  console.log(`=======================================================\n`);
  return { success: true, mock: true };
};

module.exports = {
  sendSms,
  triggerEmergencyCall
};
