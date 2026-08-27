const Interface = {
  elementos: {},
  inicializar() {
    this.elementos.telaMenu = document.getElementById('tela-menu');
    this.elementos.telaDerrota = document.getElementById('tela-derrota');
    this.elementos.telaVitoria = document.getElementById('tela-vitoria');
    this.elementos.btnIniciar = document.getElementById('btn-iniciar');
    this.elementos.btnReiniciarDerrota = document.getElementById('btn-reiniciar-derrota');
    this.elementos.btnReiniciarVitoria = document.getElementById('btn-reiniciar-vitoria');
    this.elementos.barraVida = document.getElementById('barra-vida');
    this.elementos.barraEnergia = document.getElementById('barra-energia');
  },
  configurarBotoes(aoIniciar, aoReiniciar) {
    this.elementos.btnIniciar.onclick = aoIniciar;
    this.elementos.btnReiniciarDerrota.onclick = aoReiniciar;
    this.elementos.btnReiniciarVitoria.onclick = aoReiniciar;
  },
  esconderMenu() { this.elementos.telaMenu.classList.add('escondido'); },
  mostrarDerrota() { this.elementos.telaDerrota.classList.remove('escondido'); },
  esconderDerrota() { this.elementos.telaDerrota.classList.add('escondido'); },
  mostrarVitoria() { this.elementos.telaVitoria.classList.remove('escondido'); },
  esconderVitoria() { this.elementos.telaVitoria.classList.add('escondido'); },
  atualizarHUD(jogador) {
    const pctVida = Math.max(0, jogador.vida / jogador.vidaMax) * 100;
    const pctEnergia = Math.max(0, jogador.energia / jogador.energiaMax) * 100;
    this.elementos.barraVida.style.width = pctVida + '%';
    this.elementos.barraEnergia.style.width = pctEnergia + '%';
  }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);

let jogador, inimigos, discos, rastro, destrocos, camera;
let rodando = false;
let ultimoTempo = 0;

const input = { cima: false, baixo: false, esquerda: false, direita: false };

function adicionarDestroco(x, y, cor) {
  destrocos.push(new Destroco(x, y, cor));
}

function iniciarNovoJogo() {
  stopPad();
  stopMotoAudioInstant();
  startPad();

  Mundo.gerarCidade();
  jogador = new Jogador(300, 300);
  inimigos = [];
  discos = [];
  destrocos = [];
  rastro = new RastroLuz();
  camera = { x: 0, y: 0 };

  spawnInimigo();

  Interface.esconderVitoria();
  Interface.esconderDerrota();
  Interface.esconderMenu();
  rodando = true;
  ultimoTempo = performance.now();
  requestAnimationFrame(loop);
}

function spawnInimigo() {
  let x, y;
  do {
    x = Math.random() * Mundo.largura;
    y = Math.random() * Mundo.altura;
  } while (Math.hypot(x - jogador.x, y - jogador.y) < 600 || Mundo.colideComParede(x, y, 20));

  inimigos.push(new Inimigo(x, y, gerarCorAleatoria()));
}

function arremessarDiscoJogador() {
  if (!jogador.podeArremessarDisco()) return;
  playThrow();
  jogador.energia -= 30;
  discos.push(new Disco(jogador.x, jogador.y, jogador.direcao.x, jogador.direcao.y, true, jogador.cor));
}

function criarDiscoInimigo(x, y, dirX, dirY, cor) {
  playThrow();
  discos.push(new Disco(x, y, dirX, dirY, false, cor));
}

function loop(tempoAtual) {
  if (!rodando) return;
  const dt = Math.min(0.05, (tempoAtual - ultimoTempo) / 1000);
  ultimoTempo = tempoAtual;

  atualizar(dt, tempoAtual);
  desenhar(tempoAtual);

  requestAnimationFrame(loop);
}

function atualizar(dt, tempoAtual) {
  jogador.atualizar(dt, input, Mundo);

  if (jogador.estaVivo()) {
    rastro.registrarPonto(jogador.x, jogador.y, tempoAtual);
  }
  rastro.atualizar(tempoAtual);
  rastro.verificarColisoes(inimigos, jogador, adicionarDestroco);

  for (const inimigo of inimigos) {
    inimigo.atualizar(dt, jogador, Mundo, tempoAtual, criarDiscoInimigo);
  }

  for (const disco of discos) {
    disco.atualizar(dt, jogador, inimigos, tempoAtual, Mundo, adicionarDestroco);
  }
  discos = discos.filter(d => !d.finalizado);
  inimigos = inimigos.filter(i => !i.morto);

  if (inimigos.length === 0 && jogador.estaVivo()) {
    spawnInimigo();
  }

  const distPortal = Math.hypot(jogador.x - Mundo.portal.x, jogador.y - Mundo.portal.y);
  if (jogador.estaVivo() && distPortal < Mundo.portal.raio) {
    rodando = false;
    playPortal();
    stopMotoAudioInstant();
    stopPad();
    Interface.mostrarVitoria();
    return;
  }

  camera.x = jogador.x - canvas.width / 2;
  camera.y = jogador.y - canvas.height / 2;

  Interface.atualizarHUD(jogador);

  if (!jogador.estaVivo()) {
    adicionarDestroco(jogador.x, jogador.y, jogador.cor);
    rodando = false;
    stopPad();
    setTimeout(() => {
      Interface.mostrarDerrota();
    }, 800);
  }
}

function desenhar(tempoAtual) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Mundo.desenhar(ctx, camera, tempoAtual);
  for (const d of destrocos) d.desenhar(ctx, camera);
  rastro.desenhar(ctx, camera, tempoAtual);
  for (const inimigo of inimigos) inimigo.desenhar(ctx, camera);
  for (const disco of discos) disco.desenhar(ctx, camera);
  jogador.desenhar(ctx, camera);
}

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowUp': input.cima = true; break;
    case 'ArrowDown': input.baixo = true; break;
    case 'ArrowLeft': input.esquerda = true; break;
    case 'ArrowRight': input.direita = true; break;
    case 'Space':
      if (rodando) arremessarDiscoJogador();
      e.preventDefault();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'ArrowUp': input.cima = false; break;
    case 'ArrowDown': input.baixo = false; break;
    case 'ArrowLeft': input.esquerda = false; break;
    case 'ArrowRight': input.direita = false; break;
  }
});

Interface.inicializar();
Interface.configurarBotoes(iniciarNovoJogo, iniciarNovoJogo);
