/* ================== TEXTO DE LA CARTA (edítalo si quieres) ================== */
const LETTER_TEXT = `A veces me pregunto si el tiempo realmente borra o solo enseña a vivir con lo que uno lleva dentro. 
Ha pasado más de un año, y aun así, hay días en los que mi mente vuelve a ti sin avisar. No sé si es por costumbre 
o porque, sinceramente, no he encontrado un lugar donde me sienta tan tranquilo como cuando estaba contigo.

Me he dado cuenta de que, aunque la vida siga y las responsabilidades nos llenen los días, hay personas que simplemente 
dejan huellas que no se borran. Tú fuiste, y sigues siendo, ese rincón de calma que aparecía incluso en los momentos 
más caóticos. A tu lado, todo tenía sentido, y cada instante —por pequeño que fuera— se sentía como si el mundo 
se detuviera un poco para darnos un respiro.

A veces cierro los ojos y me veo ahí, contigo, riendo, hablando de cualquier cosa, o simplemente en silencio, 
sintiendo que no hacía falta nada más. Y entonces entiendo que ese era mi lugar seguro, el que no se busca, 
sino que se encuentra una vez y se recuerda toda la vida.

No te escribo para que volvamos, ni para remover el pasado. Te escribo porque, de algún modo, siento que parte de mí 
sigue allá contigo, y necesitaba reconocerlo. Porque aunque el tiempo haya pasado, mi cariño por ti sigue siendo genuino, 
tranquilo, y lleno de gratitud por todo lo que compartimos.

Ojalá estés bien, de verdad. Y si alguna vez piensas en mí, espero que lo hagas con la misma paz y ternura 
con la que yo sigo pensando en ti.

Con todo mi corazón,
Jean Michael`;

/* ================== REFERENCIAS DEL DOM ================== */
const openBtn = document.getElementById('openBtn');
const envelope = document.getElementById('envelope');
const letter = document.getElementById('letter');
const letterBody = document.getElementById('letterBody');
const replayBtn = document.getElementById('replay');

/* ================== TIPEO (más despacio) ================== */
const TYPE_SPEED_MS = 55; // ← ajusta este valor para más lento/rápido

let typingTimer = null;
let isTyping = false;
let typedChars = 0;

function resetLetter(){
  clearInterval(typingTimer);
  isTyping = false;
  typedChars = 0;
  letterBody.textContent = '';
}

function typeLetter(speed = TYPE_SPEED_MS){
  if (isTyping) return;
  isTyping = true;
  letterBody.textContent = '';
  typedChars = 0;

  typingTimer = setInterval(()=>{
    letterBody.textContent = LETTER_TEXT.slice(0, typedChars++);
    if (typedChars > LETTER_TEXT.length){
      clearInterval(typingTimer);
      isTyping = false;
    }
  }, speed);
}

/* Abrir/cerrar sobre */
openBtn.addEventListener('click', () => {
  const opened = envelope.classList.toggle('open');
  openBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  if (opened) {
    typeLetter();
    setTimeout(()=> letter.focus(), 900);
    // "pop" sutil
    targetTZ = MAX_TZ;
    setTimeout(()=> targetTZ = 0, 600);
  } else {
    resetLetter();
  }
});

/* Reproducir de nuevo */
if (replayBtn){
  replayBtn.addEventListener('click', ()=>{
    resetLetter();
    if (!envelope.classList.contains('open')) envelope.classList.add('open');
    typeLetter();
  });
}

/* Auto-open por query ?open=1 */
(function(){
  const params = new URLSearchParams(location.search);
  if (params.get('open') === '1'){
    envelope.classList.add('open');
    setTimeout(typeLetter, 500);
  }
})();

/* ================== CIELO: ESTRELLAS + COMETA EN UN SOLO LOOP ================== */
(function(){
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  let W = 0, H = 0, dpr = 1;

  // Parámetros de estrellas
  const DENSITY = 12000;       // menor = más estrellas (W*H / DENSITY)
  const MAX_STARS = 240;
  const MIN_R = 0.25;
  const MAX_R = 1.4;
  const BASE_ALPHA = 0.35;
  const TWINKLE_AMPL = 0.75;
  const RENEW_PROB = 0.06;     // probabilidad de renacer cuando alpha baja
  let stars = [];

  // Parámetros de cometa
  let comet = null; // {x,y,vx,vy,life,max,thickness}
  let nextCometIn = 0; // segundos hasta siguiente cometa

  function rnd(a, b) { return Math.random() * (b - a) + a; }

  function resize(){
    const rect = canvas.getBoundingClientRect();
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(rect.width  * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width  = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    W = canvas.width; H = canvas.height;

    const count = Math.min(MAX_STARS, Math.max(90, Math.floor((W * H) / DENSITY)));
    stars = Array.from({ length: count }, () => spawnStar());

    // cronómetro del próximo cometa
    scheduleNextComet();
  }

  function spawnStar(){
    const speed = rnd(0.35, 1.1); // rad/s
    const phase = rnd(0, Math.PI * 2);
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: rnd(MIN_R, MAX_R),
      baseA: BASE_ALPHA,
      ampl: TWINKLE_AMPL,
      speed,
      phase,
      hue: 220 + rnd(-8, 14),
    };
  }

  function scheduleNextComet(){
    // entre 8–18 s, si no se prefiere reducir movimiento
    nextCometIn = prefersReduced ? Infinity : (8 + Math.random()*10);
  }

  function spawnComet(){
    const margin = 80 * dpr;
    const side = Math.floor(Math.random()*4); // 0 top, 1 right, 2 bottom, 3 left
    let x, y, vx, vy;
    const speed = (Math.random()*0.6 + 0.7) * dpr * 250; // px/s

    if (side === 0){
      x = Math.random() * W; y = -margin;
      const angle = (Math.random() * Math.PI/3) + Math.PI/6;
      vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
    } else if (side === 1){
      x = W+margin; y = Math.random() * H;
      const angle = Math.PI + Math.random() * (Math.PI/3) + Math.PI/6;
      vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
    } else if (side === 2){
      x = Math.random() * W; y = H+margin;
      const angle = - (Math.random() * Math.PI/3 + Math.PI/6);
      vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
    } else {
      x = -margin; y = Math.random() * H;
      const angle = (Math.random() * Math.PI/3) - Math.PI/6;
      vx = Math.cos(angle) * speed; vy = Math.sin(angle) * speed;
    }

    comet = {
      x, y, vx, vy, life: 0,
      max: Math.random()*1.2 + 1.8,
      thickness: Math.random()*0.6 + 0.9
    };
  }

  // Animación
  let rafId = null;
  let last = performance.now();

  function frame(now){
    const dt = Math.min(0.05, (now - last)/1000); // máx 50 ms
    last = now;

    // Fondo limpio
    ctx.clearRect(0,0,W,H);

    // Dibujar estrellas con parpadeo
    for (let i=0; i<stars.length; i++){
      const s = stars[i];
      s.phase += s.speed * dt;
      const twinkle = Math.cos(s.phase) ** 2;
      let alpha = s.baseA + s.ampl * (twinkle - 0.5) * 2;
      alpha = Math.max(0, Math.min(1, alpha));

      if (alpha < 0.04 && Math.random() < RENEW_PROB){
        stars[i] = spawnStar();
        continue;
      }

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${s.hue} 100% 85%)`;
      ctx.fill();
    }

    // Actualizar/comprobar cometa
    if (comet){
      comet.life += dt;
      comet.x += comet.vx * dt;
      comet.y += comet.vy * dt;

      const vlen = Math.hypot(comet.vx, comet.vy) || 1;
      const trailLen = 180 * dpr;
      const tailX = comet.x - (comet.vx / vlen) * trailLen;
      const tailY = comet.y - (comet.vy / vlen) * trailLen;

      const grad = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(1, 'rgba(170,200,255,0)');

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = comet.thickness;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(comet.x, comet.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(230,240,255,0.85)';
      ctx.arc(comet.x, comet.y, 1.4*dpr, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      if (comet.life > comet.max ||
          comet.x < -200*dpr || comet.x > W + 200*dpr ||
          comet.y < -200*dpr || comet.y > H + 200*dpr){
        comet = null;
      }
    } else {
      nextCometIn -= dt;
      if (nextCometIn <= 0){
        spawnComet();
        scheduleNextComet();
      }
    }

    // Parallax envelope (interpolación)
    curRX = lerp(curRX, targetRX, 0.08);
    curRY = lerp(curRY, targetRY, 0.08);
    curTZ = lerp(curTZ, targetTZ, 0.08);
    envelope.style.transform = `translateZ(${curTZ}px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;

    rafId = requestAnimationFrame(frame);
  }

  function start(){
    if (rafId) cancelAnimationFrame(rafId);
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop(){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener('resize', ()=>{ stop(); resize(); start(); }, {passive:true});
  resize();
  if (!prefersReduced){ start(); }
  else {
    // Dibujo estático si se prefiere reducir movimiento
    ctx.clearRect(0,0,W,H);
    for (const s of stars){
      ctx.globalAlpha = s.baseA;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${s.hue} 100% 85%)`;
      ctx.fill();
    }
  }

  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden) stop(); else start();
  });
})();

/* ================== PARALLAX (mouse + gyro) ================== */
const MAX_ROT_X = 6;  // grados
const MAX_ROT_Y = 8;  // grados
const MAX_TZ = 14;    // px "pop"
let targetRX = 0, targetRY = 0, targetTZ = 0;
let curRX = 0, curRY = 0, curTZ = 0;

function lerp(a,b,t){ return a + (b-a)*t; }

(function(){
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  if (prefersReduced) return;

  // Mouse
  window.addEventListener('mousemove', (e)=>{
    const rect = envelope.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const nx = (e.clientX - cx) / (rect.width/2);   // -1..1
    const ny = (e.clientY - cy) / (rect.height/2);  // -1..1
    targetRY = -nx * MAX_ROT_Y;
    targetRX =  ny * MAX_ROT_X;
    targetTZ = (1 - Math.min(1, Math.hypot(nx,ny))) * MAX_TZ;
  }, {passive:true});

  // Gyro (si disponible)
  if (window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation', (ev)=>{
      if (typeof ev.beta === 'number' && typeof ev.gamma === 'number'){
        const nx = Math.max(-1, Math.min(1, (ev.gamma || 0) / 45));
        const ny = Math.max(-1, Math.min(1, (ev.beta  || 0) / 45));
        targetRY = -nx * MAX_ROT_Y;
        targetRX =  ny * MAX_ROT_X;
        targetTZ = (1 - Math.min(1, Math.hypot(nx,ny))) * MAX_TZ;
      }
    }, {passive:true});
  }
})();
