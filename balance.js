// VOID RUNNER rebalance v7.1
// Loaded after the main game script by the service worker.
(() => {
  const SCORE_SCALE = 0.55;
  const MISS_PENALTY = 35;
  const FIRST_POWER_SCORE = 250;
  const POWER_STEP = 450;
  let nextPowerScore = FIRST_POWER_SCORE;

  const originalReset = reset;
  reset = function(){
    originalReset();
    nextPowerScore = FIRST_POWER_SCORE;
    powerSpawn = 1e9;
  };

  const originalUpdate = update;
  update = function(dt){
    powerSpawn = 1e9;

    let misses = 0;
    for(const o of things){
      if(o.kind === 'bad' && !o.__missed && o.y + o.vy*dt > H + 50){
        o.__missed = true;
        misses++;
      }
    }

    // Remember whether the normal spawn timer is about to fire this frame.
    // Only clamp the NEW timer after a spawn; never keep resetting an active
    // countdown or enemies will stop appearing after the first one.
    const spawningThisFrame = spawn - dt <= 0;
    const before = score;
    originalUpdate(dt);

    const gain = score - before;
    if(gain > 0) score = before + gain * SCORE_SCALE;

    if(misses){
      score = Math.max(0, score - misses * MISS_PENALTY);
      combo = 0;
      say('-' + (misses * MISS_PENALTY) + ' MISS', '#ff6b82');
      if(navigator.vibrate) navigator.vibrate(12);
    }

    // Slow the ramp while allowing the timer to count down normally.
    if(spawningThisFrame){
      const spawnFloor = Math.max(.16, .66 - time * .0095);
      if(spawn < spawnFloor) spawn = spawnFloor;
    }

    // Weapon drops are earned by score milestones rather than elapsed time.
    if(score >= nextPowerScore && !things.some(o => o.kind === 'power')){
      addPower();
      say('WEAPON DROP!', '#ffe47a');
      nextPowerScore += POWER_STEP;
    }

    scoreEl.textContent = Math.floor(score);
  };
})();
