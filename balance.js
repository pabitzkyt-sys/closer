// VOID RUNNER rebalance v7
// Loaded after the main game script by the service worker.
(() => {
  const SCORE_SCALE = 0.55;
  const MISS_PENALTY = 35;
  const FIRST_POWER_SCORE = 250;
  const POWER_STEP = 450;
  let nextPowerScore = FIRST_POWER_SCORE;
  let enemyAddedThisFrame = false;

  const originalReset = reset;
  reset = function(){
    originalReset();
    nextPowerScore = FIRST_POWER_SCORE;
    powerSpawn = 1e9;
  };

  addEnemy = function(){
    if(enemyAddedThisFrame) return;
    enemyAddedThisFrame = true;
    const r = 10 + Math.random()*18;
    things.push({
      kind:'bad',
      x:r + Math.random()*(W-r*2),
      y:-30,
      r,
      vy:145 + Math.random()*75 + time*6.2,
      a:Math.random()*6
    });
  };

  const originalUpdate = update;
  update = function(dt){
    enemyAddedThisFrame = false;
    powerSpawn = 1e9;

    let misses = 0;
    for(const o of things){
      if(o.kind === 'bad' && !o.__missed && o.y + o.vy*dt > H + 50){
        o.__missed = true;
        misses++;
      }
    }

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

    // Slow the ramp from the previous build. Never let the next normal spawn
    // become faster than this floor; difficulty still rises steadily.
    const spawnFloor = Math.max(.16, .66 - time * .0095);
    if(spawn < spawnFloor) spawn = spawnFloor;

    // Weapon drops are earned by score milestones rather than elapsed time.
    if(score >= nextPowerScore && !things.some(o => o.kind === 'power')){
      addPower();
      say('WEAPON DROP!', '#ffe47a');
      nextPowerScore += POWER_STEP;
    }

    scoreEl.textContent = Math.floor(score);
  };
})();
