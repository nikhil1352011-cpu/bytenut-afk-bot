const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy web server for Render Free Tier
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Dummy web server listening on port ${PORT}`);
});

// 2. Minecraft Bot Configuration
const bot = mineflayer.createBot({
  host: 'sgp1.bytenut.cc', 
  port: 6280,             
  username: 'AFK_Bypass_Bot',
  version: '1.21.11' 
});

bot.on('spawn', () => {
  console.log("Bot successfully joined ByteNut server!");
});

// 3. Event: Listen to chat for Login, Registration, and AFK Captchas
bot.on('message', (jsonMsg) => {
  const message = jsonMsg.toString().trim();
  console.log(`[Server Chat]: ${message}`);

  // A. Handle Registration (First time joining)
  if (message.toLowerCase().includes('please register') || message.toLowerCase().includes('/register')) {
    setTimeout(() => {
      bot.chat('/register BotPassword123 BotPassword123');
      console.log("Sent registration command.");
    }, 2000);
  }

  // B. Handle Login (Every time after the first join)
  if (message.toLowerCase().includes('please login') || message.toLowerCase().includes('/login')) {
    setTimeout(() => {
      bot.chat('/login BotPassword123');
      console.log("Sent login command.");
    }, 2000);
  }

  // C. Handle Anti-AFK Verification Captcha
  if (message.toLowerCase().includes('code') || message.toLowerCase().includes('verify')) {
    const regex = /\b[A-Za-z0-9]{4,8}\b/;
    const match = message.match(regex);

    if (match) {
      const code = match[0];
      console.log(`Found Code: ${code}. Replying in 3 seconds...`);
      setTimeout(() => {
        bot.chat(code);
      }, 3000); 
    }
  }
});

bot.on('end', () => {
  console.log("Disconnected. Reconnecting in 15 seconds...");
  setTimeout(() => process.exit(1), 15000); 
});
