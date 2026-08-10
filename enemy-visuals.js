(() => {
  const ENEMY_COLORS = ['#ff315c','#ff5a36','#ff1744','#ff7043','#d843ff','#ff3d71'];
  const ENEMY_SHAPES = ['spike','diamond','hex','shard','ring'];

  addEnemy = function(){
    const r=10+Math.random()*18;
    things.push({
      kind:'bad',
      x:r+Math.random()*(W-r*2),
      y:-30,
      r,
      vy:145+Math.random()*82+time*7.2,
      a:Math.random()*6,
      spin:(Math.random()<.5?-1:1)*(1.7+Math.random()*3.2),
      color:ENEMY_COLORS[Math.floor(Math.random()*ENEMY_COLORS.length)],
      shape:ENEMY_SHAPES[Math.floor(Math.random()*ENEMY_SHAPES.length)]
    });
  };

  function drawEnemy(o){
    const color=o.color||'#ff315c';
    const shape=o.shape||'spike';
    x.save();
    x.translate(o.x,o.y);
    x.rotate(o.a);
    x.shadowBlur=20;
    x.shadowColor=color;
    x.fillStyle=color;
    x.strokeStyle='#ffffff99';
    x.lineWidth=Math.max(1.2,o.r*.07);
    x.beginPath();

    if(shape==='diamond'){
      x.moveTo(0,-o.r*1.12);x.lineTo(o.r*.82,0);x.lineTo(0,o.r*1.12);x.lineTo(-o.r*.82,0);x.closePath();
    }else if(shape==='hex'){
      for(let j=0;j<6;j++){
        const a=-Math.PI/2+j*Math.PI/3,px=Math.cos(a)*o.r,py=Math.sin(a)*o.r;
        j?x.lineTo(px,py):x.moveTo(px,py);
      }
      x.closePath();
    }else if(shape==='shard'){
      x.moveTo(0,-o.r*1.25);x.lineTo(o.r*.55,-o.r*.2);x.lineTo(o.r*.25,o.r*1.05);x.lineTo(-o.r*.45,o.r*.55);x.lineTo(-o.r*.72,-o.r*.32);x.closePath();
    }else if(shape==='ring'){
      x.arc(0,0,o.r,0,Math.PI*2);
    }else{
      for(let j=0;j<10;j++){
        const a=j*Math.PI/5,rad=o.r*(j%2?.55:1.08),px=Math.cos(a)*rad,py=Math.sin(a)*rad;
        j?x.lineTo(px,py):x.moveTo(px,py);
      }
      x.closePath();
    }

    if(shape==='ring'){
      x.lineWidth=Math.max(4,o.r*.32);x.strokeStyle=color;x.stroke();
      x.lineWidth=1.5;x.strokeStyle='#fff9';x.beginPath();x.arc(0,0,o.r*.58,0,Math.PI*2);x.stroke();
    }else{
      x.fill();x.stroke();
      x.globalAlpha=.42;x.fillStyle='#fff';x.beginPath();x.arc(-o.r*.22,-o.r*.24,Math.max(1.5,o.r*.12),0,Math.PI*2);x.fill();x.globalAlpha=1;
    }
    x.restore();
  }

  draw = function(){
    x.save();
    if(shake){x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.88}
    starfield();
    for(let o of things){
      if(o.kind==='bad'){
        drawEnemy(o);
      }else if(o.kind==='core'){
        x.save();x.translate(o.x,o.y);x.rotate(o.a);x.shadowBlur=24;x.shadowColor='#77f7ff';x.strokeStyle='#77f7ff';x.lineWidth=3;x.beginPath();x.arc(0,0,o.r,0,Math.PI*2);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(0,0,3.5,0,Math.PI*2);x.fill();x.restore();
      }else{
        let info=POWER_INFO[o.type];x.save();x.translate(o.x,o.y);x.rotate(o.a);x.shadowBlur=28;x.shadowColor=info.color;x.strokeStyle=info.color;x.lineWidth=3;x.fillStyle='#11162c';x.beginPath();for(let j=0;j<6;j++){let a=-Math.PI/2+j*Math.PI/3,px=Math.cos(a)*o.r,py=Math.sin(a)*o.r;j?x.lineTo(px,py):x.moveTo(px,py)}x.closePath();x.fill();x.stroke();x.rotate(-o.a);x.fillStyle=info.color;x.font='900 12px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(o.type==='spread'?'3':o.type==='twin'?'II':'⚡',0,1);x.restore();
      }
    }
    for(let s of shots){x.save();x.shadowBlur=18;x.shadowColor=s.color;x.fillStyle='#fff';x.fillRect(s.x-2,s.y-12,4,16);x.fillStyle=s.color;x.fillRect(s.x-1,s.y+4,2,10);x.restore()}
    for(let p of particles){x.globalAlpha=Math.max(0,p.life/p.max);x.fillStyle=p.color;x.fillRect(p.x,p.y,p.size,p.size)}x.globalAlpha=1;
    if(player){x.save();x.translate(player.x,player.y);x.shadowBlur=26;x.shadowColor=powerType?POWER_INFO[powerType].color:'#a878ff';x.fillStyle=powerType?POWER_INFO[powerType].color:'#b58cff';x.beginPath();x.moveTo(0,-18);x.lineTo(14,13);x.lineTo(0,8);x.lineTo(-14,13);x.closePath();x.fill();x.fillStyle='#77f7ff';x.fillRect(-3,-17,6,7);x.beginPath();x.moveTo(-5,10);x.lineTo(0,23+Math.random()*8);x.lineTo(5,10);x.fill();x.restore()}
    x.restore();
  };
})();
