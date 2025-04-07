const axios = require('axios');
const cron = require('node-cron');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Function to send a telegram message
async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
    });
    console.log('Telegram message sent');
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
  }
}

// Auto send every Monday at 9AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Weekly telegram message triggered.');
  await sendTelegramMessage("Weekly Update: Here is your dashboard summary!");
});

module.exports = { sendTelegramMessage };

