// Replace your old initializeSafeMovement function with this one:
function initializeSafeMovement() {
  console.log("Pipeline authorized. Commencing ambient activity sequences...");
  
  // Set jumping posture permanently
  bot.setControlState('jump', true);

  if (physicsLoop) clearInterval(physicsLoop);

  let directionToggle = true;

  // Active movement engine running every 2.5 seconds
  physicsLoop = setInterval(() => {
    if (!bot || !bot.entity) return;

    // Reset old walking vectors
    bot.setControlState('forward', false);
    bot.setControlState('back', false);

    // Toggle back and forth between coordinates so it physically moves blocks
    if (directionToggle) {
      bot.setControlState('forward', true);
      console.log("[Movement Engine]: Walking forward 1 block...");
    } else {
      bot.setControlState('back', true);
      console.log("[Movement Engine]: Walking backward 1 block...");
    }

    // Swing arm and change view angles to simulate player physics updates
    bot.swingArm('right');
    const horizontalAngle = (Math.random() * 360 - 180) * (Math.PI / 180);
    bot.look(horizontalAngle, 0, true);

    // Switch direction flag for the next cycle
    directionToggle = !directionToggle;

  }, 2500);
}
