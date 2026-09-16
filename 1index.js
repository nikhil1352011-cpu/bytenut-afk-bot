const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy Web Server for Render & UptimeRobot Pings
const server = http.createServer((req, res) => {
  if (req.url === '/ping' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive!\n');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');
  }
});
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Pinger server active and running on port ${PORT}`);
});

// 2. Client Parameters Configuration
const bot = mineflayer.createBot({
  host: 'sgp1.bytenut.cc', 
  port: 6280,             
  username: 'AFK_Bypass_Bot2',
  version: '1.21.11',
  viewDistance: 'tiny',
  checkTimeoutInterval: 90000 
});

// Crucial: Declaring global control loops properly to prevent startup crashes
let loginProcessed = false;
let physicsLoop = null;

bot.on('spawn', () => {
  console.log("Client connected. Holding positions for network verification...");
  
  loginProcessed = false;
  if (physicsLoop) {
    clearInterval(physicsLoop);
    physicsLoop = null;
  }
  bot.clearControlStates();
});

// 3. Central Captcha Extraction Engine
function processTextPacket(rawText, source) {
  if (!rawText) return false;

  let parsedText = rawText
    .replace(/§[0-9a-fk-or]/gi, '')
    .replace(/[{}":\[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (parsedText.toLowerCase().includes('code') || parsedText.toLowerCase().includes('verify')) {
    console.log(`[Alert Filtered - Source: ${source}]: ${parsedText}`);
    
    const codeMatch = parsedText.match(/code\s+([a-z0-9]+)/i);

    if (codeMatch && codeMatch[1]) {
      const extractedKey = codeMatch[1];
      console.log(`Target Verification Sequence Found: ${extractedKey}`);

      setTimeout(() => {
        if (bot && bot.entity) {
          bot.chat(extractedKey);
          console.log(`Submitted Sequence Response: ${extractedKey}`);
        }
      }, 4000);
      return true;
    }
  }
  return false;
}

// 4. Inbound System Chat Handler
bot.on('message', (jsonMsg, position) => {
  if (position === 'member_defined' || position === 'player') return;

  const chatString = jsonMsg.toString().trim();
  const verified = processTextPacket(chatString, "System Chat");

  if (!verified && !loginProcessed) {
    if (chatString.toLowerCase().includes('register') || chatString.toLowerCase().includes('/register')) {
      loginProcessed = true;
      setTimeout(() => {
        bot.chat('/register BotPassword123 BotPassword123');
        console.log("Dispatched profile registration layout.");
        initializeSafeMovement();
      }, 3500);
    }
    
    if (chatString.toLowerCase().includes('login') || chatString.toLowerCase().includes('/login')) {
      loginProcessed = true;
      setTimeout(() => {
        bot.chat('/login BotPassword123');
        console.log("Dispatched credential verification package.");
        initializeSafeMovement();
      }, 3500);
    }
  }
});

// 5. Interface Component Tracking (Bossbars)
bot.on('bossbarCreated', (bossbar) => { evaluateBossbarStructure(bossbar); });
bot.on('bossbarUpdated', (bossbar) => { evaluateBossbarStructure(bossbar); });

function evaluateBossbarStructure(bossbar) {
  if (!bossbar) return;
  let rawContent = "";
  
  if (bossbar.title) {
    rawContent = typeof bossbar.title === 'string' ? bossbar.title : JSON.stringify(bossbar.title);
  } else if (bossbar.text) {
    rawContent = String(bossbar.text);
  } else {
    return;
  }

  processTextPacket(rawContent, "Bossbar Interface Component");
}

// 6. Active Grid-Based Motion Simulation
function initializeSafeMovement() {
  console.log("Pipeline authorized. Commencing safe movement loops...");
  
  bot.setControlState('jump', true);

  if (physicsLoop) clearInterval(physicsLoop);

  let directionToggle = true;

  physicsLoop = setInterval(() => {
    if (!bot || !bot.entity) return;

    bot.setControlState('forward', false);
    bot.setControlState('back', false);

    if (directionToggle) {
      bot.setControlState('forward', true);
      console.log("[Movement Engine]: Walking forward 1 block...");
    } else {
      bot.setControlState('back', true);
      console.log("[Movement Engine]: Walking backward 1 block...");
    }

    bot.swingArm('right');
    const horizontalAngle = (Math.random() * 360 - 180) * (Math.PI / 180);
    bot.look(horizontalAngle, 0, true);

    directionToggle = !directionToggle;
  }, 2500);
}

// 7. Network Exception Handling
bot.on('error', (networkError) => {
  console.log(`[Network Warning Monitored]: ${networkError.message}`);
});

bot.on('end', (disconnectReason) => {
  console.log(`Session terminated (${disconnectReason}). Rebooting layer...`);
  loginProcessed = false;
  if (physicsLoop) {
    clearInterval(physicsLoop);
    physicsLoop = null;
  }
  setTimeout(() => process.exit(1), 20000);
});
