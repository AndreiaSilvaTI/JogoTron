/* ============================================================
   ARMAS.JS — Disco de Identidade e Rastro de Luz da Light Cycle
   ============================================================ */

/* ---------------------- DISCO DE IDENTIDADE ---------------------- */
class Disco {
  constructor(x, y, dirX, dirY) {
    this.x = x;
    this.y = y;
    this.dirX = dirX;
    this.dirY = dirY;
    this.velocidade = 620;
    this.alcance = 320;       // distância máxima antes de voltar
    this.distanciaPercorrida = 0;
    this.retornando = false;
    this.dano = 25;
    this.raio = 10;
    this.atingidos = new Set(); // evita bater no mesmo inimigo várias vezes na ida
    this.finalizado = false;
    this.cor = '#4de3ff';
  }

  atualizar(dt, jogador) {
    const deslocamento = this.velocidade * dt;

    if (!this.retornando) {
      this.x += this.dirX * deslocamento;
      this.y += this.dirY * deslocamento;
      this.distanciaPercorrida += deslocamento;
      if (this.distanciaPercorrida >= this.alcance) {
        this.retornando = true;
        this.atingidos.clear(); // permite acertar de novo na volta
      }
    } else {
      // Vetor de volta até o jogador
      const dx = jogador.x - this.x;
      const dy = jogador.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 18) {
        this.finalizado = true;
        return;
      }
      this.x += (dx / dist) * deslocamento;
      this.y += (dy / dist) * deslocamento;
    }
  }

  /** Verifica colisão com uma lista de inimigos e aplica dano */
  verificarColisoes(inimigos) {
    for (const inimigo of inimigos) {
      if (inimigo.morto || this.atingidos.has(inimigo)) continue;
      const dist = Math.hypot(inimigo.x - this.x, inimigo.y - this.y);
      if (dist < this.raio + inimigo.tamanho) {
        inimigo.receberDano(this.dano);
        this.atingidos.add(inimigo);
      }
    }
  }

  desenhar(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    ctx.save();
    ctx.fillStyle = this.cor;
    ctx.shadowColor = this.cor;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(sx, sy, this.raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/* ---------------------- RASTRO DE LUZ (LIGHT CYCLE) ---------------------- */
class RastroLuz {
  constructor() {
    this.pontos = []; // { x, y, criadoEm }
    this.duracaoMs = 2600;     // quanto tempo cada segmento do rastro dura
    this.distanciaMinima = 14; // espaçamento mínimo entre pontos registrados
    this.dano = 1.2;           // dano por segundo de contato
  }

  /** Chamado a cada frame em que o jogador está na Light Cycle */
  registrarPonto(x, y, tempoAtual) {
    const ultimo = this.pontos[this.pontos.length - 1];
    if (!ultimo || Math.hypot(x - ultimo.x, y - ultimo.y) >= this.distanciaMinima) {
      this.pontos.push({ x, y, criadoEm: tempoAtual });
    }
  }

  atualizar(tempoAtual) {
    // Remove pontos antigos (o rastro "some" com o tempo)
    while (this.pontos.length && tempoAtual - this.pontos[0].criadoEm > this.duracaoMs) {
      this.pontos.shift();
    }
  }

  /** Dano por segundo a inimigos que tocam no rastro */
  verificarColisoes(inimigos, dt) {
    for (const inimigo of inimigos) {
      if (inimigo.morto) continue;
      for (const ponto of this.pontos) {
        const dist = Math.hypot(inimigo.x - ponto.x, inimigo.y - ponto.y);
        if (dist < inimigo.tamanho + 4) {
          inimigo.receberDano(this.dano * 60 * dt); // normalizado para "dano por segundo"
          break;
        }
      }
    }
  }

  desenhar(ctx, camera, tempoAtual) {
    if (this.pontos.length < 2) return;
    ctx.save();
    ctx.strokeStyle = '#4de3ff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#4de3ff';
    ctx.shadowBlur = 10;
    ctx.lineCap = 'round';

    for (let i = 1; i < this.pontos.length; i++) {
      const anterior = this.pontos[i - 1];
      const atual = this.pontos[i];
      const idade = (tempoAtual - atual.criadoEm) / this.duracaoMs;
      ctx.globalAlpha = Math.max(0, 1 - idade);
      ctx.beginPath();
      ctx.moveTo(anterior.x - camera.x, anterior.y - camera.y);
      ctx.lineTo(atual.x - camera.x, atual.y - camera.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
