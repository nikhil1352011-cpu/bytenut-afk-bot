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

// 3. Keep the normal chat listener ONLY for Login / Registration
bot.on('message', (jsonMsg) => {
  const message = jsonMsg.toString().trim();
  
  if (message.toLowerCase().includes('please register') || message.toLowerCase().includes('/register')) {
    setTimeout(() => {
      bot.chat('/register BotPassword123 BotPassword123');
      console.log("Sent registration command.");
    }, 2000);
  }

  if (message.toLowerCase().includes('please login') || message.toLowerCase().includes('/login')) {
    setTimeout(() => {
      bot.chat('/login BotPassword123');
      console.log("Sent login command.");
    }, 2000);
  }
});

// 4. NEW Bossbar Listener: This targets the exact alert from your screenshot
bot.on('bossbarCreated', (bossbar) => {
  handleBossbar(bossbar);
});

bot.on('bossbarUpdated', (bossbar) => {
  handleBossbar(bossbar);
});

function handleBossbar(bossbar) {
  // Convert the bossbar text component to a readable string
  const text = bossbar.title.toString().trim();
  console.log(`[Bossbar Active]: ${text}`);

  // Trigger if the bossbar contains the phrase from your image
  if (text.toLowerCase().includes('enter code')) {
    
    // Regex extracts the 5-letter lowercase word (like "nhrapf")
    // It grabs any standalone 5 to 6 letter word that sits right after "code"
    const regex = /code\s+([a-z0-9]{5,6})/i;
    const match = text.match(regex);

    if (match && match[1]) {
      const captchaCode = match[1];
      console.log(`Detected Bossbar Captcha Code: ${captchaCode}`);

      // Wait 3 seconds to look human before typing it out
      setTimeout(() => {
        bot.chat(captchaCode);
        console.log(`Sent captcha code: ${captchaCode} into chat!`);
      }, 3000);
    }
  }
}

bot.on('end', () => {
  console.log("Disconnected. Reconnecting in 15 seconds...");
  setTimeout(() => process.exit(1), 15000); 
});
