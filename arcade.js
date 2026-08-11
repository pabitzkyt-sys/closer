// VOID RUNNER arcade expansion v14
(() => {
  const oldReset=reset, oldUpdate=update, oldDraw=draw, oldAddEnemy=addEnemy, oldAddPower=addPower, oldDie=die;
  let level=1,boss=null,nextBoss=2500,bossKills=0,bossCooldown=0,nearMisses=0,shield=0,slow=0,mult=1,multLeft=0,waveClock=5,lastKills=0,coins=0,reviving=false,coinTimer=1.5;
  const extraPowers=['pierce','shield','slow','mult','bomb'];
  Object.assign(POWER_INFO,{pierce:{name:'PIERCING',color:'#7ab8ff'},shield:{name:'SHIELD',color:'#72a7ff'},slow:{name:'SLOW TIME',color:'#b58cff'},mult:{name:'2X SCORE',color:'#ffe47a'},bomb:{name:'VOID BOMB',color:'#ffffff'}});

  const hud=document.querySelector('.hud');
  let coinPill=document.querySelector('#coinPill');
  if(!coinPill){coinPill=document.createElement('div');coinPill.id='coinPill';coinPill.className='pill';coinPill.innerHTML='COINS 🪙 <span id="coinCount">0</span>';hud.insertBefore(coinPill,hud.children[2]||null)}
  const coinEl=coinPill.querySelector('#coinCount');

  const overCard=over.querySelector('.card');
  let reviveBtn=document.querySelector('#reviveBtn');
  if(!reviveBtn){reviveBtn=document.createElement('button');reviveBtn.id='reviveBtn';reviveBtn.style.marginTop='10px';reviveBtn.style.background='linear-gradient(135deg,#ffe47a,#ff9f43)';const againBtn=document.querySelector('#again');overCard.insertBefore(reviveBtn,againBtn)}

  function levelSpeed(){return 1+(level-1)*.16}
  function reviveCost(){return 10*level}
  function updateCoins(){coinEl.textContent=coins;reviveBtn.textContent=`REVIVE • ${reviveCost()} 🪙`;reviveBtn.disabled=coins<reviveCost();reviveBtn.style.opacity=coins<reviveCost()?'.45':'1'}
  function spawnCoin(){things.push({kind:'coin',x:26+Math.random()*(W-52),y:-24,r:12,vy:105+level*3,a:0})}

  reset=function(){oldReset();level=1;boss=null;nextBoss=2500;bossKills=0;bossCooldown=0;nearMisses=0;shield=0;slow=0;mult=1;multLeft=0;waveClock=5;lastKills=0;coins=0;reviving=false;coinTimer=1.2;coreSpawn=1e9;updateCoins()};

  addEnemy=function(){
    oldAddEnemy(); const o=things[things.length-1]; if(!o||o.kind!=='bad')return;
    o.vy=(145+Math.random()*65)*levelSpeed(); o.baseX=o.x;o.t=0;o.hp=1;o.maxHp=1;
    const r=Math.random();
    if(r<.18){o.beh='hunter';o.color='#d45cff'}
    else if(level>=2&&r<.34){o.beh='zig';o.color='#ff8a45'}
    else if(level>=2&&r<.48){o.beh='split';o.color='#ff4f9a'}
    else if(level>=3&&r<.60){o.beh='armor';o.hp=o.maxHp=3;o.r*=1.18;o.color='#ffd166'}
    else o.beh='normal';
  };

  addPower=function(){const all=['spread','twin','rapid',...extraPowers];let type=all[Math.floor(Math.random()*all.length)];things.push({kind:'power',type,x:30+Math.random()*(W-60),y:-30,r:14,vy:110,a:0})};

  const oldActivate=activatePower;
  activatePower=function(type){
    if(['spread','twin','rapid'].includes(type)){oldActivate(type);return}
    if(type==='shield'){shield=1;say('SHIELD READY','#72a7ff');return}
    if(type==='slow'){slow=10;say('SLOW TIME 10s','#b58cff');return}
    if(type==='mult'){mult=2;multLeft=10;say('2X SCORE 10s','#ffe47a');return}
    if(type==='bomb'){let n=0;for(let i=things.length-1;i>=0;i--)if(things[i].kind==='bad'){burst(things[i].x,things[i].y,'#fff',12);things.splice(i,1);n++}score+=n*25;say('VOID BOMB!','#fff');return}
    powerType=type;powerLeft=10;powerName.textContent=POWER_INFO[type].name;powerTime.textContent='10.0';powerHud.style.color=POWER_INFO[type].color;powerHud.classList.add('on');say(POWER_INFO[type].name+'!','#fff')
  };

  const oldShoot=shoot;
  shoot=function(){if(powerType==='pierce'){shots.push({x:player.x,y:player.y-20,vx:0,vy:-700,r:5,color:'#7ab8ff',pierce:true});return}oldShoot()};

  function spawnBoss(){things=things.filter(o=>o.kind!=='bad');boss={x:W/2,y:90,r:46,hp:35+level*12,maxHp:35+level*12,t:0,dir:1};bossCooldown=0;say('BOSS '+level+'!','#ff6b82');shake=8}
  function wave(){let pattern=Math.floor(Math.random()*3),n=5+Math.min(4,level);for(let i=0;i<n;i++){addEnemy();let o=things[things.length-1];if(pattern===0)o.x=W*(i+1)/(n+1);else if(pattern===1)o.x=W/2+(i-(n-1)/2)*34;else o.x=25+Math.random()*(W-50);o.y=-25-i*28}say('ENEMY WAVE','#ff8a6b')}

  die=function(){oldDie();reviving=true;setTimeout(()=>{updateCoins();reviveBtn.style.display='block'},330)};

  reviveBtn.onclick=()=>{const cost=reviveCost();if(coins<cost)return;coins-=cost;updateCoins();reviving=false;over.classList.add('hidden');things=things.filter(o=>o.kind!=='bad');shots=[];particles=[];player.x=W/2;player.target=W/2;player.y=H*.78;shield=1;spawn=.55;running=true;last=performance.now();say('REVIVED!','#ffe47a');requestAnimationFrame(loop)};

  update=function(dt){
    coreSpawn=1e9;
    coinTimer-=dt;
    if(coinTimer<=0&&!boss){spawnCoin();coinTimer=2.0+Math.random()*1.8}

    for(let i=things.length-1;i>=0;i--){
      const o=things[i];
      if(o.kind==='coin'){
        o.y+=o.vy*dt;o.a+=dt*4;
        if(o.y>H+35){things.splice(i,1);continue}
        const dx=o.x-player.x,dy=o.y-player.y,rr=o.r+player.r;
        if(dx*dx+dy*dy<rr*rr){things.splice(i,1);coins+=1;updateCoins();burst(o.x,o.y,'#ffd95a',18);say('+1 COIN','#ffd95a');if(navigator.vibrate)navigator.vibrate(14)}
      }
    }

    const preScore=score;
    oldUpdate(dt); if(!running)return;
    coreSpawn=1e9;

    for(const o of things)if(o.kind==='bad'){
      o.t=(o.t||0)+dt;
      if(o.beh==='zig')o.x=Math.max(o.r,Math.min(W-o.r,o.baseX+Math.sin(o.t*4.2)*55));
      if(o.beh==='hunter'){const chase=75+level*10;o.x+=Math.sign(player.x-o.x)*chase*dt;o.x=Math.max(o.r,Math.min(W-o.r,o.x))}
    }
    if(mult>1&&score>preScore)score=preScore+(score-preScore)*mult;
    if(multLeft>0){multLeft-=dt;if(multLeft<=0)mult=1}
    if(slow>0){slow-=dt;for(const o of things)if(o.kind==='bad')o.y-=o.vy*dt*.42}
    waveClock-=dt;if(!boss&&waveClock<=0){wave();waveClock=8+Math.random()*5}
    if(!boss&&score>=nextBoss)spawnBoss();
    if(boss){
      boss.t+=dt;bossCooldown-=dt;boss.x+=boss.dir*(80+level*8)*dt;if(boss.x<boss.r||boss.x>W-boss.r)boss.dir*=-1;
      if(bossCooldown<=0){for(let k=-2;k<=2;k++){let r=11;things.push({kind:'bad',x:boss.x+k*22,y:boss.y+30,r,vy:(115+level*14),a:0,beh:'normal',hp:1,maxHp:1,color:'#ff315c'})}bossCooldown=Math.max(.7,1.5-level*.08)}
      for(let i=shots.length-1;i>=0;i--){let s=shots[i],dx=s.x-boss.x,dy=s.y-boss.y;if(dx*dx+dy*dy<(s.r+boss.r)**2){boss.hp--;if(!s.pierce)shots.splice(i,1);burst(s.x,s.y,s.color,5);if(boss.hp<=0){score+=750*level;bossKills++;level++;nextBoss+=2500;burst(boss.x,boss.y,'#fff',80);say('LEVEL '+level+' • SPEED UP!','#77f7ff');boss=null;things=things.filter(o=>o.kind!=='bad');shake=18;updateCoins();break}}}
      if(boss){let dx=boss.x-player.x,dy=boss.y-player.y;if(dx*dx+dy*dy<(boss.r+player.r)**2){if(shield){shield=0;boss.hp-=5;say('SHIELD SAVED YOU','#72a7ff')}else{die();return}}}
    }
    for(const o of things)if(o.kind==='bad'&&!o.near&&o.y>player.y-8&&o.y<player.y+20){let d=Math.abs(o.x-player.x);if(d>o.r+player.r&&d<o.r+player.r+18){o.near=true;nearMisses++;score+=25*mult;say('NEAR MISS +'+(25*mult),'#8cffb7')}}
    scoreEl.textContent=Math.floor(score);
  };

  draw=function(){
    oldDraw();
    for(const o of things)if(o.kind==='coin'){
      x.save();x.translate(o.x,o.y);x.rotate(Math.sin(o.a)*.25);x.shadowBlur=20;x.shadowColor='#ffd95a';x.fillStyle='#f6b92b';x.strokeStyle='#fff1a6';x.lineWidth=2;x.beginPath();x.ellipse(0,0,o.r,o.r*.82,0,0,Math.PI*2);x.fill();x.stroke();x.strokeStyle='#b97500';x.lineWidth=2;x.beginPath();x.ellipse(0,0,o.r*.62,o.r*.52,0,0,Math.PI*2);x.stroke();x.fillStyle='#7a4b00';x.font='900 13px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText('$',0,1);x.restore()
    }
    if(boss){x.save();x.translate(boss.x,boss.y);x.shadowBlur=30;x.shadowColor='#ff315c';x.strokeStyle='#ff6b82';x.fillStyle='#32102a';x.lineWidth=4;x.beginPath();for(let i=0;i<12;i++){let a=i*Math.PI/6,r=boss.r*(i%2?0.72:1);i?x.lineTo(Math.cos(a)*r,Math.sin(a)*r):x.moveTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.stroke();x.restore();x.fillStyle='#30111b';x.fillRect(30,112,W-60,9);x.fillStyle='#ff5475';x.fillRect(30,112,(W-60)*boss.hp/boss.maxHp,9)}
    x.save();x.font='800 12px system-ui';x.fillStyle='#cbd5ff';x.textAlign='center';x.fillText('LEVEL '+level+(shield?' • SHIELD':'')+(mult>1?' • 2X':''),W/2,145);x.restore()
  };

  updateCoins();
})();
