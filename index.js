const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy web server for Render Free Tier
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running safely!\n');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Dummy web server listening on port ${PORT}`);
});

// 2. Realistic Minecraft Bot Client Configuration
const bot = mineflayer.createBot({
  host: 'sgp1.bytenut.cc', 
  port: 6280,             
  username: 'AFK_Bypass_Bot',
  version: '1.21.11',
  
  // These settings mimic a standard vanilla Minecraft player client profile
  viewDistance: 'normal',
  chatStars: true,
  colorsEnabled: true,
  skinParts: {
    cape: true,
    jacket: true,
    leftSleeve: true,
    rightSleeve: true,
    leftPants: true,
    rightPants: true,
    hat: true
  },
  // Stops the bot from sending too many internal system packets at once
  checkTimeoutInterval: 30000 
});

let authenticationSent = false;

bot.on('spawn', () => {
  console.log("Bot successfully joined ByteNut server!");
  authenticationSent = false; 
});

// 3. System chat listener for Login / Registration
bot.on('message', (jsonMsg, position) => {
  if (position === 'member_defined' || position === 'player') return; 

  const message = jsonMsg.toString().trim();
  
  if (!authenticationSent) {
    if (message.toLowerCase().includes('please register') || message.toLowerCase().includes('/register')) {
      authenticationSent = true;
      setTimeout(() => {
        bot.chat('/register BotPassword123 BotPassword123');
        console.log("Sent registration command.");
      }, 2000);
    }

    if (message.toLowerCase().includes('please login') || message.toLowerCase().includes('/login')) {
      authenticationSent = true;
      setTimeout(() => {
        bot.chat('/login BotPassword123');
        console.log("Sent login command.");
      }, 2000);
    }
  }
});

// 4. Bossbar Extraction Logic
bot.on('bossbarCreated', (bossbar) => { handleBossbar(bossbar); });
bot.on('bossbarUpdated', (bossbar) => { handleBossbar(bossbar); });

function handleBossbar(bossbar) {
  if (!bossbar.title) return;
  
  const text = bossbar.title.toString().trim();
  console.log(`[Bossbar Checked]: ${text}`);

  if (text.toLowerCase().includes('enter code')) {
    const regex = /code\s+([a-z0-9]{5,6})/i;
    const match = text.match(regex);

    if (match && match[1]) {
      const captchaCode = match[1];
      console.log(`Matched Captcha Code: ${captchaCode}`);

      setTimeout(() => {
        bot.chat(captchaCode);
        console.log(`Submitted Captcha Answer: ${captchaCode}`);
      }, 3500);
    }
  }
}

bot.on('error', (err) => {
  console.error(`Socket connection error encountered: ${err.message}`);
});

bot.on('end', (reason) => {
  console.log(`Disconnected from server (${reason}). Reconnecting execution engine...`);
  setTimeout(() => process.exit(1), 15000); 
});
