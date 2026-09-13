const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'http://sgp1.bytenut.cc/', // Example: myserver.bytenut.net
  port: 6280, 
  username: 'AFK_Bypass_Bot',
  version: '1.20.1' // Match this to your server version
});

bot.on('spawn', () => {
  console.log("Bot successfully joined ByteNut server!");
});

// Listen to the chat stream for the verification captcha
bot.on('message', (jsonMsg) => {
  const message = jsonMsg.toString().trim();
  console.log(`[Server Chat]: ${message}`);

  // Look for keywords indicating an anti-AFK check
  if (message.toLowerCase().includes('code') || message.toLowerCase().includes('verify')) {

    // Regex extracts any alphanumeric code that is 4 to 8 characters long
    const regex = /\b[A-Za-z0-9]{4,8}\b/;
    const match = message.match(regex);

    if (match) {
      const code = match[0];
      console.log(`Found Code: ${code}. Replying in 3 seconds...`);

      setTimeout(() => {
        bot.chat(code);
      }, 3000); // 3-second delay to look human
    }
  }
});

// Auto-reconnect logic if kicked
bot.on('end', () => {
  console.log("Disconnected. Reconnecting in 15 seconds...");
  setTimeout(() => process.exit(1), 15000); 
});
