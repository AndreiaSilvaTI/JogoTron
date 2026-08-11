/* ============================================================
   GAME.JS — Loop principal, mundo (Grid), câmera e integração
   ============================================================ */

(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  ajustarCanvas();
  window.addEventListener('resize', ajustarCanvas);

  /* ---------------------- MUNDO (GRID) ---------------------- */
  const Mundo = {
    largura: 3000,
    altura: 3000,
    tamanhoCelula: 60,
    paredes: [], // blocos de "servidor" que bloqueiam movimento

    gerarParedes() {
      // Gera blocos de servidor espalhados pelo Grid (evitando o centro, onde o jogador nasce)
      this.paredes = [];
      const quantidade = 26;
      for (let i = 0; i < quantidade; i++) {
        const largura = 80 + Math.random() * 140;
        const altura = 80 + Math.random() * 140;
        let x, y;
        do {
          x = Math.random() * (this.largura - largura);
          y = Math.random() * (this.altura - altura);
        } while (Math.hypot(x - this.largura / 2, y - this.altura / 2) < 300);
        this.paredes.push({ x, y, largura, altura });
      }
    },

    colideComParede(x, y, raio) {
      if (x - raio < 0 || x + raio > this.largura || y - raio < 0 || y + raio > this.altura) {
        return true;
      }
      for (const p of this.paredes) {
        if (x + raio > p.x && x - raio < p.x + p.largura &&
            y + raio > p.y && y - raio < p.y + p.altura) {
          return true;
        }
      }
      return false;
    },

    desenhar(ctx, camera) {
      // Linhas do Grid
      ctx.strokeStyle = 'rgba(15, 122, 153, 0.35)';
      ctx.lineWidth = 1;

      const inicioX = Math.floor(camera.x / this.tamanhoCelula) * this.tamanhoCelula;
      const inicioY = Math.floor(camera.y / this.tamanhoCelula) * this.tamanhoCelula;

      for (let x = inicioX; x < camera.x + canvas.width + this.tamanhoCelula; x += this.tamanhoCelula) {
        ctx.beginPath();
        ctx.moveTo(x - camera.x, 0);
        ctx.lineTo(x - camera.x, canvas.height);
        ctx.stroke();
      }
      for (let y = inicioY; y < camera.y + canvas.height + this.tamanhoCelula; y += this.tamanhoCelula) {
        ctx.beginPath();
        ctx.moveTo(0, y - camera.y);
        ctx.lineTo(canvas.width, y - camera.y);
        ctx.stroke();
      }

      // Blocos de servidor (paredes)
      for (const p of this.paredes) {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        if (sx + p.largura < 0 || sx > canvas.width || sy + p.altura < 0 || sy > canvas.height) continue;
        ctx.fillStyle = '#081420';
        ctx.strokeStyle = '#ff9331';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff9331';
        ctx.shadowBlur = 8;
        ctx.fillRect(sx, sy, p.largura, p.altura);
        ctx.strokeRect(sx, sy, p.largura, p.altura);
        ctx.shadowBlur = 0;
      }
    }
  };

  /* ---------------------- ESTADO DO JOGO ---------------------- */
  let jogador, inimigos, discos, rastro, camera;
  let rodando = false;
  let ultimoTempo = 0;
  let proximoSpawnEm = 0;

  const input = { cima: false, baixo: false, esquerda: false, direita: false };

  function iniciarNovoJogo() {
    Mundo.gerarParedes();
    jogador = new Jogador(Mundo.largura / 2, Mundo.altura / 2);
    inimigos = [];
    discos = [];
    rastro = new RastroLuz();
    camera = { x: 0, y: 0 };
    proximoSpawnEm = 0;

    for (let i = 0; i < 6; i++) spawnInimigo();

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
    } while (Math.hypot(x - jogador.x, y - jogador.y) < 400 || Mundo.colideComParede(x, y, 20));
    inimigos.push(new Inimigo(x, y));
  }

  function arremessarDisco(tempoAtual) {
    if (!jogador.podeArremessarDisco(tempoAtual)) return;
    jogador.energia -= 20;
    discos.push(new Disco(jogador.x, jogador.y, jogador.direcao.x, jogador.direcao.y));
  }

  /* ---------------------- LOOP PRINCIPAL ---------------------- */
  function loop(tempoAtual) {
    if (!rodando) return;
    const dt = Math.min(0.05, (tempoAtual - ultimoTempo) / 1000); // segundos, limitado p/ evitar saltos
    ultimoTempo = tempoAtual;

    atualizar(dt, tempoAtual);
    desenhar(tempoAtual);

    requestAnimationFrame(loop);
  }

  function atualizar(dt, tempoAtual) {
    jogador.atualizar(dt, input, Mundo, tempoAtual);

    if (jogador.naLightCycle) {
      rastro.registrarPonto(jogador.x, jogador.y, tempoAtual);
    }
    rastro.atualizar(tempoAtual);
    rastro.verificarColisoes(inimigos, dt);

    for (const inimigo of inimigos) {
      inimigo.atualizar(dt, jogador, Mundo, tempoAtual);
    }

    for (const disco of discos) {
      disco.atualizar(dt, jogador);
      disco.verificarColisoes(inimigos);
    }
    discos = discos.filter(d => !d.finalizado);

    // Remove inimigos mortos e agenda respawn gradual (mundo "vivo")
    inimigos = inimigos.filter(i => !i.morto);
    if (tempoAtual > proximoSpawnEm && inimigos.length < 8) {
      spawnInimigo();
      proximoSpawnEm = tempoAtual + 4000;
    }

    // Câmera segue o jogador, centralizada
    camera.x = Math.max(0, Math.min(Mundo.largura - canvas.width, jogador.x - canvas.width / 2));
    camera.y = Math.max(0, Math.min(Mundo.altura - canvas.height, jogador.y - canvas.height / 2));

    Interface.atualizarHUD(jogador);

    if (!jogador.estaVivo()) {
      rodando = false;
      Interface.mostrarDerrota();
    }
  }

  function desenhar(tempoAtual) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Mundo.desenhar(ctx, camera);
    rastro.desenhar(ctx, camera, tempoAtual);
    for (const inimigo of inimigos) inimigo.desenhar(ctx, camera);
    for (const disco of discos) disco.desenhar(ctx, camera);
    jogador.desenhar(ctx, camera, tempoAtual);
  }

  /* ---------------------- INPUT ---------------------- */
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': input.cima = true; break;
      case 'KeyS': case 'ArrowDown': input.baixo = true; break;
      case 'KeyA': case 'ArrowLeft': input.esquerda = true; break;
      case 'KeyD': case 'ArrowRight': input.direita = true; break;
      case 'Space':
        if (rodando) arremessarDisco(performance.now());
        e.preventDefault();
        break;
      case 'KeyC':
        if (rodando) jogador.alternarLightCycle();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': input.cima = false; break;
      case 'KeyS': case 'ArrowDown': input.baixo = false; break;
      case 'KeyA': case 'ArrowLeft': input.esquerda = false; break;
      case 'KeyD': case 'ArrowRight': input.direita = false; break;
    }
  });

  /* ---------------------- INICIALIZAÇÃO ---------------------- */
  Interface.inicializar();
  Interface.configurarBotoes(iniciarNovoJogo, iniciarNovoJogo);
})();
