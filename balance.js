// VOID RUNNER rebalance v7.2
// Loaded after the main game script by the service worker.
(() => {
  const SCORE_SCALE = 0.55;
  const MISS_PENALTY = 35;
  const FIRST_POWER_SCORE = 250;
  const POWER_STEP = 450;
  let nextPowerScore = FIRST_POWER_SCORE;
  let enemySilence = 0;

  const originalReset = reset;
  reset = function(){
    originalReset();
    nextPowerScore = FIRST_POWER_SCORE;
    enemySilence = 0;
    powerSpawn = 1e9;
  };

  const originalUpdate = update;
  update = function(dt){
    powerSpawn = 1e9;

    // Recover automatically if an older override ever leaves the spawn timer
    // in a broken state.
    if(!Number.isFinite(spawn) || spawn > 3) spawn = 0.45;

    let misses = 0;
    for(const o of things){
      if(o.kind === 'bad' && !o.__missed && o.y + o.vy*dt > H + 50){
        o.__missed = true;
        misses++;
      }
    }

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

    // Slow the ramp only after the normal game has just chosen a new spawn
    // delay. Never freeze a countdown that is already running.
    if(spawningThisFrame){
      const spawnFloor = Math.max(.16, .66 - time * .0095);
      if(spawn < spawnFloor) spawn = spawnFloor;
    }

    // Fail-safe: if the field has no enemies for too long, force one in.
    // This prevents any override/cache edge case from leaving the game empty.
    const enemyCount = things.reduce((n,o)=>n+(o.kind === 'bad' ? 1 : 0),0);
    if(running && enemyCount === 0){
      enemySilence += dt;
      if(enemySilence >= 0.8){
        addEnemy();
        enemySilence = 0;
        spawn = Math.min(spawn, 0.65);
      }
    }else{
      enemySilence = 0;
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
