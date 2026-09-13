const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy web server for Render Free Tier
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot running with heavy clean regex and non-stop movement!\n');
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
  checkTimeoutInterval: 30000 
});

let authenticationSent = false;
let movementInterval = null;

bot.on('spawn', () => {
  console.log("Bot successfully joined ByteNut server!");
  authenticationSent = false; 

  // Make the bot CONSTANTLY jump non-stop
  bot.setControlState('jump', true);

  // Clear old movement intervals if respawning
  if (movementInterval) clearInterval(movementInterval);

  // Non-stop movement loop: changes walking directions constantly every 2 seconds
  movementInterval = setInterval(() => {
    if (!bot || !bot.entity) return;

    // Pick a completely random movement pattern
    const moves = ['forward', 'back', 'left', 'right'];
    const activeMove = moves[Math.floor(Math.random() * moves.length)];
    
    // Reset all directions first
    moves.forEach(m => bot.setControlState(m, false));
    
    // Enable the random direction
    bot.setControlState(activeMove, true);

    // Make the bot look around constantly
    const randomYaw = (Math.random() * 360 - 180) * (Math.PI / 180);
    bot.look(randomYaw, 0, true);
    bot.swingArm('right');
  }, 2000);
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

// 4. Heavy-Duty Fail-Safe Bossbar Extraction Logic
bot.on('bossbarCreated', (bossbar) => { handleBossbar(bossbar); });
bot.on('bossbarUpdated', (bossbar) => { handleBossbar(bossbar); });

function handleBossbar(bossbar) {
  if (!bossbar.title) return;
  
  // Turn whatever data object the bossbar is into a raw string
  let rawText = String(bossbar.title);

  // HEAVY CLEAN FILTER: Strips away formatting codes (§), JSON formatting ({"text":}), 
  // brackets, quotation marks, and slashes, leaving ONLY plain numbers and letters.
  let cleanText = rawText
    .replace(/§[0-9a-fk-or]/gi, '') // Removes Minecraft color codes
    .replace(/[{}":\[\]\\]/g, ' ') // Blanks out JSON syntax characters
    .replace(/\s+/g, ' ')          // Cleans up messy duplicate spaces
    .trim();

  console.log(`[Raw Data Cleaned]: ${cleanText}`);

  // Checks if our newly flattened text contains the activation phrase
  if (cleanText.toLowerCase().includes('enter code')) {
    
    // Search the text for any isolated 4-7 character word containing letters/numbers
    // mapping directly after the word "code"
    const regex = /code\s+([a-z0-9]{4,7})/i;
    const match = cleanText.match(regex);

    if (match && match[1]) {
      const captchaCode = match[1];
      console.log(`Bypass Target Isolated: ${captchaCode}`);

      // Respond after a human-like 3 second delay
      setTimeout(() => {
        bot.chat(captchaCode);
        console.log(`Successfully typed "${captchaCode}" into the server chat.`);
      }, 3000);
    }
  }
}

bot.on('error', (err) => {
  console.error(`Socket connection error encountered: ${err.message}`);
});

bot.on('end', (reason) => {
  console.log(`Disconnected from server (${reason}). Reconnecting...`);
  if (movementInterval) clearInterval(movementInterval);
  setTimeout(() => process.exit(1), 15000); 
});
