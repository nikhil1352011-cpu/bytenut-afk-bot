const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy web server for Render Free Tier
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('AFK Bot with unlocked code regex is running!\n');
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
  viewDistance: 'normal',
  chatStars: true,
  colorsEnabled: true,
  skinParts: { cape: true, jacket: true, leftSleeve: true, rightSleeve: true, leftPants: true, rightPants: true, hat: true },
  checkTimeoutInterval: 60000 
});

let authenticationSent = false;
let movementInterval = null;

bot.on('spawn', () => {
  console.log("Bot successfully joined ByteNut server!");
  authenticationSent = false; 

  bot.setControlState('jump', true);
  if (movementInterval) clearInterval(movementInterval);

  movementInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    const moves = ['forward', 'back', 'left', 'right'];
    const activeMove = moves[Math.floor(Math.random() * moves.length)];
    moves.forEach(m => bot.setControlState(m, false));
    bot.setControlState(activeMove, true);
    const randomYaw = (Math.random() * 360 - 180) * (Math.PI / 180);
    bot.look(randomYaw, 0, true);
    bot.swingArm('right');
  }, 5000);
});

// Helper function to process any text string and extract the verification code
function parseTextForCaptcha(rawText, sourceLabel) {
  // Strip colors and weird brackets out
  let cleanText = rawText
    .replace(/§[0-9a-fk-or]/gi, '')
    .replace(/[{}":\[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.toLowerCase().includes('code')) {
    console.log(`[Processing ${sourceLabel}]: ${cleanText}`);
    
    // This looks for "code" followed by any spacing, and grabs the next single word cleanly
    const regex = /code\s+([a-z0-9]+)/i;
    const match = cleanText.match(regex);

    if (match && match[1]) {
      const captchaCode = match[1];
      console.log(`SUCCESS! Isolated Target Code via ${sourceLabel}: ${captchaCode}`);

      setTimeout(() => {
        bot.chat(captchaCode);
        console.log(`Submitted Captcha Answer: ${captchaCode}`);
      }, 3500);
      return true;
    }
  }
  return false;
}

// 3. System Chat Stream Listener (Watches for Login and the Bossbar log message)
bot.on('message', (jsonMsg, position) => {
  if (position === 'member_defined' || position === 'player') return; 
  const message = jsonMsg.toString().trim();
  
  // Try to see if this chat log message contains the verification code
  const handledCaptcha = parseTextForCaptcha(message, "Chat Stream");

  if (!handledCaptcha && !authenticationSent) {
    if (message.toLowerCase().includes('register') || message.toLowerCase().includes('/register')) {
      authenticationSent = true;
      setTimeout(() => {
        bot.chat('/register BotPassword123 BotPassword123');
        console.log("Sent registration command.");
      }, 3000);
    }
    if (message.toLowerCase().includes('login') || message.toLowerCase().includes('/login')) {
      authenticationSent = true;
      setTimeout(() => {
        bot.chat('/login BotPassword123');
        console.log("Sent login command.");
      }, 3000);
    }
  }
});

// 4. Bossbar Listener (Acts as a backup tracker if chat format changes)
bot.on('bossbarCreated', (bossbar) => { handleBossbar(bossbar); });
bot.on('bossbarUpdated', (bossbar) => { handleBossbar(bossbar); });

function handleBossbar(bossbar) {
  if (!bossbar) return;
  let text = "";
  if (bossbar.title) {
    text = typeof bossbar.title === 'string' ? bossbar.title : JSON.stringify(bossbar.title);
  } else if (bossbar.text) {
    text = String(bossbar.text);
  } else {
    return;
  }
  parseTextForCaptcha(text, "Direct Bossbar");
}

bot.on('error', (err) => {
  console.error(`Socket Error: ${err.message}`);
});

bot.on('end', (reason) => {
  console.log(`Disconnected (${reason}). Reconnecting...`);
  if (movementInterval) clearInterval(movementInterval);
  setTimeout(() => process.exit(1), 20000); 
});
