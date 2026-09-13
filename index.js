const mineflayer = require('mineflayer');
const http = require('http');

// 1. Dummy Web Server for Hosting Platforms
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minecraft AFK Engine Active\n');
});
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Dummy server running on port ${PORT}`);
});

// 2. Client Parameter Layer
const bot = mineflayer.createBot({
  host: 'sgp1.bytenut.cc', 
  port: 6280,             
  username: 'AFK_Bypass_Bot',
  version: '1.21.11',
  viewDistance: 'tiny',
  checkTimeoutInterval: 90000 // Extended network timeout buffer
});

// State Management Flags
let loginProcessed = false;
let physicsLoop = null;

bot.on('spawn', () => {
  console.log("Client connected. Holding positions for network verification...");
  
  // Clear any existing physics states to ensure a steady login state
  loginProcessed = false;
  if (physicsLoop) {
    clearInterval(physicsLoop);
    physicsLoop = null;
  }
  bot.clearControlStates();
});

// 3. Central Captcha & Log Extraction Core
function processTextPacket(rawText, source) {
  if (!rawText) return;

  // Clean raw strings from Minecraft color indicators (§) and JSON markers
  let parsedText = rawText
    .replace(/§[0-9a-fk-or]/gi, '')
    .replace(/[{}":\[\]\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Evaluate the parsed string for verification keywords
  if (parsedText.toLowerCase().includes('code') || parsedText.toLowerCase().includes('verify')) {
    console.log(`[Alert Filtered - Source: ${source}]: ${parsedText}`);
    
    // Capture the immediate subsequent token after the keyword 'code'
    const codeMatch = parsedText.match(/code\s+([a-z0-9]+)/i);

    if (codeMatch && codeMatch[1]) {
      const extractedKey = codeMatch[1];
      console.log(`Target Verification Sequence Found: ${extractedKey}`);

      // Human-like response execution window
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
  // Disregard standard client player interactions to isolate system notifications
  if (position === 'member_defined' || position === 'player') return;

  const chatString = jsonMsg.toString().trim();

  // Attempt verification parsing immediately from the chat notification
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

// 5. Active Interface Component Tracking (Bossbar Observers)
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

// 6. Non-Disruptive Motion Simulation (Activates ONLY post-authorization)
function initializeSafeMovement() {
  console.log("Pipeline authorized. Commencing ambient activity sequences...");
  
  // Set jumping posture
  bot.setControlState('jump', true);

  // Broad interval cycle prevents input vector flooding issues (EPIPE mitigation)
  physicsLoop = setInterval(() => {
    if (!bot || !bot.entity) return;

    const actionVectors = ['forward', 'back', 'left', 'right'];
    const selectedVector = actionVectors[Math.floor(Math.random() * actionVectors.length)];
    
    actionVectors.forEach(vector => bot.setControlState(vector, false));
    bot.setControlState(selectedVector, true);

    const horizontalAngle = (Math.random() * 360 - 180) * (Math.PI / 180);
    bot.look(horizontalAngle, 0, true);
    bot.swingArm('right');
  }, 7000);
}

// 7. Network Exception Boundaries
bot.on('error', (networkError) => {
  console.log(`[Network Warning Monitored]: ${networkError.message}`);
});

bot.on('end', (disconnectReason) => {
  console.log(`Session terminated via protocol state (${disconnectReason}). Rebooting layer...`);
  loginProcessed = false;
  if (physicsLoop) {
    clearInterval(physicsLoop);
    physicsLoop = null;
  }
  // Terminate execution safely to trigger the platform's engine wrapper restart
  setTimeout(() => process.exit(1), 20000);
});
